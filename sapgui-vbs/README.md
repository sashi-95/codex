# sapgui-vbs — SAP GUIスクリプティング (VBS) × Power Automate Desktop

`docs/SAP_GUI_VBS_AUTOMATION_CATALOG.md` のカタログに対応する実装。
取引コード別のVBSは共通ライブラリの規約 (名前付き引数 / 終了コード /
結果ファイル) に従っており、PADフローから統一的に呼び出せる。

```
sapgui-vbs/
├── lib/SapCommon.vbs                  # 共通ライブラリ (接続/ログ/検証/終了コード)
├── scripts/
│   ├── FB60_VendorInvoice.vbs         # FI: 仕入先請求書入力 + FB03読み戻し検証
│   ├── FBL1N_VendorLineItems.vbs      # FI: 仕入先明細照会 → ファイル出力
│   ├── VA01_CreateSalesOrder.vbs      # SD: 受注登録 (明細CSV) + VA03読み戻し検証
│   └── ME2N_OpenPOReport.vbs          # MM: 発注一覧照会 → ファイル出力
├── samples/va01_items_sample.csv      # VA01明細CSVの例
└── logs/                              # 実行ログ・結果ファイル (自動生成)
```

## 使用前の必須作業

0. **文字コード変換**: このリポジトリはUTF-8で管理しているが、
   cscript.exe はUTF-8のVBSを正しく解釈できない (日本語が化けて構文エラーになる)。
   **Windowsへ配置する際は必ず Shift-JIS (CP932) または UTF-16 LE (BOM付き)
   に変換して保存すること** (例: `Get-Content -Encoding UTF8 in.vbs |
   Out-File out.vbs -Encoding Unicode)
1. **スクリプト有効化**: サーバ `RZ11 sapgui/user_scripting=TRUE`、
   クライアントはSAP GUIオプションでスクリプト許可
2. **画面項目IDの差し替え**: `wnd[0]/usr/...` のIDはSAPバージョン・
   画面バリアント・GUIレイアウトで変わる。**対象環境で Alt+F12
   (Script Recording and Playback) を実行して記録したIDに必ず差し替える。**
   雛形のIDは一般的なECC/S4構成の参考値
3. **Bot用SAPユーザ**: 取引コード単位の最小権限ロール。人間のIDを使わない
4. まず `/DryRun:1` で画面入力チェックまでを検証してから本番投入する

## Power Automate Desktop からの呼び出し

### フローの基本形 (FB60の例)

```
1. [Excel/SharePoint] 処理対象の請求書データを1件取得
2. [台帳突合] 冪等キー (仕入先+請求書番号) が処理済みでないか確認
3. [アプリケーションの実行]
     cscript.exe //Nologo C:\bot\sapgui-vbs\scripts\FB60_VendorInvoice.vbs
       /BUKRS:%BUKRS% /LIFNR:%LIFNR% /BLDAT:%BLDAT% /BUDAT:%BUDAT%
       /XBLNR:%XBLNR% /WRBTR:%WRBTR% /MWSKZ:V1 /HKONT:%HKONT% /KOSTL:%KOSTL%
     → 「アプリケーションの終了を待つ」ON、終了コードを変数へ
4. [スイッチ] 終了コードで分岐
     0 → 結果ファイルから DocumentNumber を読み取り台帳記録 + Teams完了通知
     1 → 依頼元へ差し戻し (入力不備)
     2 → ログ添付で例外キューへ (SAPエラー)
     3 → Bot VMヘルスチェック → ops通知
     4 → 【最優先】転記済みだが検証NG → 即時有人確認
5. [ファイル読込] logs\FB60_<RunId>.result.txt (Key=Value形式)
```

「VBScriptの実行」アクションでも動くが、**引数・終了コード・タイムアウトの
制御がしやすい「アプリケーションの実行」+ cscript.exe を推奨**。

### 結果ファイルの形式

```
RunId=20260712_153001
Script=FB60
Vendor=100001
Reference=INV-A100
Amount=55000
StatusMessage=伝票 5100000123 は会社コード 1000 に転記されました
DocumentNumber=5100000123
Verification=OK
Status=OK
ExitCode=0
```

## 設計上の約束事 (全スクリプト共通)

- **資格情報を持たない**: ログオン済みセッションへのアタッチのみ
- **SAP接触前に入力検証**: 日付・数値・必須チェックはVBS冒頭 (exit 1)
- **全操作をログ**: SET/KEY/BTN/POPUP/STATUSを1行ずつ記録し、台帳に添付可能
- **転記系は読み戻し検証**: FB60→FB03、VA01→VA03。NGは exit 4 で即時有人へ
- **ポップアップは内容を記録してから閉じる**: 警告の握り潰しを防ぐ
- **DryRunモード**: 保存直前で中断し、画面入力チェックまでの成否を返す

## 新しい取引コードを追加する手順

1. カタログ (`docs/SAP_GUI_VBS_AUTOMATION_CATALOG.md`) にリスクレベルと変数を定義
2. Alt+F12で対象取引の操作を記録し、生成VBSから画面項目IDを取得
3. 既存スクリプト (転記系はFB60、照会系はFBL1N) をコピーして
   ID・変数・検証用照会Tcodeを差し替え
4. `/DryRun:1` → 検証環境で本実行 → PADフロー組み込み、の順で昇格
