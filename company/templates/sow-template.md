# Statement of Work (SOW) Template — 作業範囲記述書

> ⚠️ **本テンプレートは弁護士レビュー前のドラフトであり、法的助言ではない。**
> 初回締結前に必ずNY州の弁護士レビューを受け、以後レビュー済み版を正とする。
> MSA併用時は、本SOWはMSAの下位文書となる (msa-outline.md参照)。

---

# STATEMENT OF WORK #{{番号}}

Effective Date: {{日付}}
Client: {{顧客法人名}} ("Client")
Provider: Clearline Automation LLC ("Provider")

## 1. Project Overview (概要)

Provider will design, build, test, and deploy an automation for Client's
{{業務名}} process, as described in Proposal {{番号}} dated {{日付}},
which is incorporated by reference.

## 2. Scope of Work (作業範囲)

### 2.1 In Scope (含まれる)
- {{自動化するステップの列挙 — 提案書§3と一致}}
- Deliverables (成果物): 動作する自動化 (本番環境) / 運用runbook /
  引き継ぎ資料・録画 / ロールバック手順書 / 手動代替手順書 / UAT記録 /
  ソースコードおよび設定一式

### 2.2 Out of Scope (含まれない)
- {{明示列挙 — 提案書§7と一致}}
- ERP/基幹システム本体の設定変更、新規ソフトウェアライセンス費用、
  本SOWに記載のないシステムとの統合
- 追加要望は変更管理 (§8) に従い別途合意する

## 3. Timeline (スケジュール)

開始日 (Day 1) は §5 のClient提供物が揃った日とする。
Day 1-2 技術検証 / Day 3-7 実装・中間デモ / Day 8-10 UAT /
Day 11-12 本番リリース / リリース後5営業日 Hypercare。

## 4. Fees and Payment (料金・支払)

- 固定料金: USD {{金額}} (Assessment充当後)
- 支払: 50%を本SOW署名時 (着手条件)、50%をUAT完了時 (§6)。支払期日: 請求から15日
- 遅延利息: 月1.5%。**着手金の入金確認をもって作業を開始する**

## 5. Client Responsibilities (お客様の責任)

1. Day 1までのシステムアクセス発行 ({{必要アカウント・権限の列挙}})
2. 担当者の参加 (中間デモ30分、UAT 60分×2、引き継ぎ60分)
3. サンプルデータおよびテスト環境の提供
4. **Clientの提供遅延による遅延日数は、納期に同日数加算される (料金は不変)**

## 6. Acceptance (検収)

UATはClientの業務担当者が合意済みテストケースに基づき実施する。
全テストケース合格をもって検収完了とし、残額の支払義務が発生する。
UAT開始から5営業日以内に書面の不合格通知がない場合、検収されたものとみなす。

## 7. Data Handling and Security (データ取扱い)

1. ProviderはClientデータを本SOWの目的以外に使用しない
2. **外部AIサービスへ送信するデータの範囲: {{明記}}。学習に利用されない
   API設定を使用し、範囲外のデータは送信しない**
3. 顧客データは専用リポジトリ・専用認証情報で分離管理する
4. 財務処理・支払・削除・権限変更に該当する自動処理は人間の承認を要する設計とする
5. プロジェクト終了後{{30}}日以内に、Clientの求めに応じデータを削除し通知する

## 8. Change Management (変更管理)

スコープ変更は書面 (メール可) による見積と双方合意の後に実施する。
合意なき追加作業の義務をProviderは負わない。

## 9. Intellectual Property (知的財産)

1. Deliverables (成果物) の権利は、全額支払完了をもってClientに帰属する
2. ただしProviderが従前から保有するテンプレート・ライブラリ・ノウハウ
   ("Pre-existing IP") の権利はProviderに留保され、Clientは成果物の利用に
   必要な範囲で非独占的ライセンスを得る
3. Providerは案件から得た**匿名化された**知見・汎用部品を再利用できる
   (Clientの機密情報・識別可能情報を含まない形に限る)

## 10. Warranty / Support (保証・保守)

リリース後30日間、仕様不適合の無償修正を行う (Hypercare含む)。
以後の監視・障害対応・改善はMonthly Support契約 (別紙) による。

## 11. Limitation of Liability (責任制限)

Providerの累積責任は本SOWでClientが支払った金額を上限とする。
間接損害・逸失利益は免責。{{弁護士確認: 州法上の強行規定}}

## 12. Termination (解約)

いずれの当事者も14日前の書面通知で解約できる。解約時、Clientは
実施済み作業に相当する料金 (マイルストーン按分) を支払う。

---
署名欄: Client / Provider それぞれの署名・氏名・役職・日付
