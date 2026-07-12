' ============================================================
' FB60_VendorInvoice.vbs - 仕入先請求書入力 (FI / リスクL2)
'
' PO無し経費請求書の転記。転記後にFB03で読み戻し検証まで行う。
'
' PADからの呼び出し例:
'   cscript //Nologo FB60_VendorInvoice.vbs ^
'     /BUKRS:1000 /LIFNR:100001 /BLDAT:20260701 /BUDAT:20260712 ^
'     /XBLNR:INV-A100 /WRBTR:55000 /MWSKZ:V1 ^
'     /HKONT:6200000 /KOSTL:CC1000 /SGTXT:"7月分保守料" [/DryRun:1]
'
' 変数:
'   BUKRS  会社コード          BLDAT  請求書日付 (YYYYMMDD)
'   LIFNR  仕入先コード        BUDAT  転記日付 (YYYYMMDD)
'   XBLNR  参照(先方請求書番号) WRBTR  総額(税込)
'   MWSKZ  税コード            HKONT  費用GL勘定
'   KOSTL  原価センタ(任意)     SGTXT  明細テキスト(任意)
'   DryRun 1=画面入力のみで保存せず中断 (新環境での動作確認用)
'
' 注意: 画面項目IDはECC/S4のバージョンと画面バリアントに依存する。
'       必ず対象環境で Alt+F12 記録を行い、IDを差し替えて使うこと。
' ============================================================
Option Explicit

Dim fsoBoot: Set fsoBoot = CreateObject("Scripting.FileSystemObject")
ExecuteGlobal fsoBoot.OpenTextFile( _
    fsoBoot.GetParentFolderName(fsoBoot.GetParentFolderName(WScript.ScriptFullName)) & "\lib\SapCommon.vbs", 1).ReadAll

InitRun "FB60"

' ---- 1. 入力の取得と検証 (SAPに触る前に落とす: exit 1) ----
Dim BUKRS, LIFNR, BLDAT, BUDAT, XBLNR, WRBTR, MWSKZ, HKONT, KOSTL, SGTXT, DryRun
BUKRS = GetArg("BUKRS", True, "")
LIFNR = GetArg("LIFNR", True, "")
BLDAT = GetArg("BLDAT", True, "")
BUDAT = GetArg("BUDAT", True, "")
XBLNR = GetArg("XBLNR", True, "")
WRBTR = GetArg("WRBTR", True, "")
MWSKZ = GetArg("MWSKZ", True, "")
HKONT = GetArg("HKONT", True, "")
KOSTL = GetArg("KOSTL", False, "")
SGTXT = GetArg("SGTXT", False, "")
DryRun = GetArg("DryRun", False, "0")

AssertDate "BLDAT", BLDAT
AssertDate "BUDAT", BUDAT
AssertNumeric "WRBTR", WRBTR
WriteResult "Vendor", LIFNR
WriteResult "Reference", XBLNR
WriteResult "Amount", WRBTR

' ---- 2. セッション接続 → FB60起動 ----
Dim session: Set session = AttachSession()
StartTcode session, "FB60"

' 初回起動時のみ会社コード入力ポップアップが出る
If FieldExists(session, "wnd[1]/usr/ctxtBKPF-BUKRS") Then
    SetField session, "wnd[1]/usr/ctxtBKPF-BUKRS", BUKRS
    session.FindById("wnd[1]").SendVKey 0
    Log "会社コードポップアップ: " & BUKRS
End If

' ---- 3. ヘッダ (基本データタブ) ----
SetField session, "wnd[0]/usr/subITEMS:SAPLFSKB:0100/subBASIS:SAPLFDCB:0010/ctxtINVFO-ACCNT", LIFNR
SetField session, "wnd[0]/usr/subITEMS:SAPLFSKB:0100/subBASIS:SAPLFDCB:0010/ctxtINVFO-BLDAT", FormatSapDate(BLDAT)
SetField session, "wnd[0]/usr/subITEMS:SAPLFSKB:0100/subBASIS:SAPLFDCB:0010/ctxtINVFO-BUDAT", FormatSapDate(BUDAT)
SetField session, "wnd[0]/usr/subITEMS:SAPLFSKB:0100/subBASIS:SAPLFDCB:0010/txtINVFO-XBLNR", XBLNR
SetField session, "wnd[0]/usr/subITEMS:SAPLFSKB:0100/subBASIS:SAPLFDCB:0010/txtINVFO-WRBTR", WRBTR
SetField session, "wnd[0]/usr/subITEMS:SAPLFSKB:0100/subBASIS:SAPLFDCB:0010/ctxtINVFO-MWSKZ", MWSKZ

' ---- 4. 明細1行目 (GL勘定・金額・原価センタ) ----
Dim tbl: tbl = "wnd[0]/usr/subITEMS:SAPLFSKB:0100/tblSAPLFSKBTABLE/"
SetField session, tbl & "ctxtACGL_ITEM-HKONT[1,0]", HKONT
SetField session, tbl & "txtACGL_ITEM-WRBTR[4,0]", WRBTR
If KOSTL <> "" Then SetField session, tbl & "ctxtACGL_ITEM-KOSTL[9,0]", KOSTL
If SGTXT <> "" Then SetField session, tbl & "txtACGL_ITEM-SGTXT[7,0]", SGTXT

' 入力チェック (Enterでフィールド検証を走らせる)
PressEnter session
If StatusType(session) = "E" Then
    Fail EXIT_SAP_ERROR, "入力チェックNG: " & StatusText(session)
End If

' ---- 5. DryRun: 保存せず中断 ----
If DryRun = "1" Then
    Log "DryRun指定のため保存せず中断"
    AbortTransaction session
    WriteResult "DryRun", "OK (画面入力チェックまで成功)"
    Succeed
End If

' ---- 6. 転記 (保存) → 伝票番号取得 ----
PressSave session
Dim docNo: docNo = ConfirmPosting(session, "DocumentNumber")

' ---- 7. 読み戻し検証: FB03で伝票を開き直して存在確認 ----
StartTcode session, "FB03"
SetField session, "wnd[0]/usr/txtRF05L-BELNR", docNo
SetField session, "wnd[0]/usr/ctxtRF05L-BUKRS", BUKRS
SetField session, "wnd[0]/usr/txtRF05L-GJAHR", Left(BUDAT, 4)
PressEnter session
If StatusType(session) = "E" Then
    WriteResult "Verification", "NG"
    Fail EXIT_VERIFY_FAILED, "伝票 " & docNo & " のFB03読み戻しに失敗: " & StatusText(session)
End If
Log "FB03読み戻しOK: 伝票 " & docNo & " が照会可能"
WriteResult "Verification", "OK"
AbortTransaction session

Succeed

' ---- ヘルパ: YYYYMMDD → SAP画面の日付書式 (環境の書式設定に合わせて変更) ----
Function FormatSapDate(yyyymmdd)
    FormatSapDate = Mid(yyyymmdd, 5, 2) & "/" & Mid(yyyymmdd, 7, 2) & "/" & Left(yyyymmdd, 4)
End Function
