' ============================================================
' VA01_CreateSalesOrder.vbs - 受注登録 (SD / リスクL1-L2)
'
' メール・FAX・Excel受注の転記を自動化。明細はCSVファイルで複数行に対応。
'
' PADからの呼び出し例:
'   cscript //Nologo VA01_CreateSalesOrder.vbs ^
'     /AUART:OR /VKORG:1000 /VTWEG:10 /SPART:00 ^
'     /KUNNR:C-2001 /BSTKD:PO-CUST-889 /ITEMS:C:\bot\in\items_889.csv [/DryRun:1]
'
' 変数:
'   AUART  受注タイプ (OR=標準受注)   VKORG  販売組織
'   VTWEG  流通チャネル               SPART  製品部門
'   KUNNR  受注先コード               BSTKD  顧客発注番号
'   ITEMS  明細CSVパス (ヘッダ行: MATNR,KWMENG / 例: MAT-100,5)
'   DryRun 1=保存せず中断
'
' 注意: 明細テーブルのIDはGUIレイアウトで変わる。Alt+F12で記録して差し替えること。
' ============================================================
Option Explicit

Dim fsoBoot: Set fsoBoot = CreateObject("Scripting.FileSystemObject")
ExecuteGlobal fsoBoot.OpenTextFile( _
    fsoBoot.GetParentFolderName(fsoBoot.GetParentFolderName(WScript.ScriptFullName)) & "\lib\SapCommon.vbs", 1).ReadAll

InitRun "VA01"

Dim AUART, VKORG, VTWEG, SPART, KUNNR, BSTKD, ITEMS, DryRun
AUART = GetArg("AUART", True, "")
VKORG = GetArg("VKORG", True, "")
VTWEG = GetArg("VTWEG", True, "")
SPART = GetArg("SPART", True, "")
KUNNR = GetArg("KUNNR", True, "")
BSTKD = GetArg("BSTKD", True, "")
ITEMS = GetArg("ITEMS", True, "")
DryRun = GetArg("DryRun", False, "0")

' ---- 明細CSVの読み込みと検証 (SAPに触る前に) ----
If Not gFso.FileExists(ITEMS) Then Fail EXIT_INPUT_ERROR, "明細CSVが存在しません: " & ITEMS
Dim lines, itemList(), itemCount, f, line, parts
itemCount = 0
ReDim itemList(99)
Set f = gFso.OpenTextFile(ITEMS, 1)
f.ReadLine ' ヘッダ行 (MATNR,KWMENG) を読み飛ばし
Do While Not f.AtEndOfStream
    line = Trim(f.ReadLine)
    If line <> "" Then
        parts = Split(line, ",")
        If UBound(parts) < 1 Then Fail EXIT_INPUT_ERROR, "明細CSVの形式エラー: " & line
        AssertNumeric "KWMENG(" & parts(0) & ")", parts(1)
        itemList(itemCount) = Array(Trim(parts(0)), Trim(parts(1)))
        itemCount = itemCount + 1
    End If
Loop
f.Close
If itemCount = 0 Then Fail EXIT_INPUT_ERROR, "明細が0件です"
Log "明細CSV読込: " & itemCount & "行"
WriteResult "Customer", KUNNR
WriteResult "CustomerPO", BSTKD
WriteResult "ItemCount", itemCount

Dim session: Set session = AttachSession()
StartTcode session, "VA01"

' ---- 初期画面 ----
SetField session, "wnd[0]/usr/ctxtVBAK-AUART", AUART
SetField session, "wnd[0]/usr/ctxtVBAK-VKORG", VKORG
SetField session, "wnd[0]/usr/ctxtVBAK-VTWEG", VTWEG
SetField session, "wnd[0]/usr/ctxtVBAK-SPART", SPART
PressEnter session
If StatusType(session) = "E" Then Fail EXIT_SAP_ERROR, "初期画面エラー: " & StatusText(session)

' ---- 概要画面: 受注先・顧客発注番号 ----
SetField session, "wnd[0]/usr/subSUBSCREEN_HEADER:SAPMV45A:4021/subPART-SUB:SAPMV45A:4701/ctxtKUAGV-KUNNR", KUNNR
SetField session, "wnd[0]/usr/subSUBSCREEN_HEADER:SAPMV45A:4021/txtVBKD-BSTKD", BSTKD

' ---- 明細行の入力 ----
Dim i, rowId, qtyId, itemTbl
itemTbl = "wnd[0]/usr/tabsTAXI_TABSTRIP_OVERVIEW/tabpT\01/ssubSUBSCREEN_BODY:SAPMV45A:4400/subSUBSCREEN_TC:SAPMV45A:4900/tblSAPMV45ATCTRL_U_ERF_AUFTRAG/"
For i = 0 To itemCount - 1
    rowId = itemTbl & "ctxtRV45A-MABNR[1," & i & "]"
    qtyId = itemTbl & "txtRV45A-KWMENG[2," & i & "]"
    SetField session, rowId, itemList(i)(0)
    SetField session, qtyId, itemList(i)(1)
Next

' 入力チェック (与信・在庫確認等のポップアップは内容をログして続行)
PressEnter session
DismissWarningPopups session, 3
If StatusType(session) = "E" Then Fail EXIT_SAP_ERROR, "明細チェックNG: " & StatusText(session)

' ---- DryRun ----
If DryRun = "1" Then
    Log "DryRun指定のため保存せず中断"
    AbortTransaction session
    WriteResult "DryRun", "OK (明細チェックまで成功)"
    Succeed
End If

' ---- 保存 → 受注番号取得 ----
PressSave session
Dim orderNo: orderNo = ConfirmPosting(session, "SalesOrderNumber")

' ---- 読み戻し検証: VA03で受注を開き直す ----
StartTcode session, "VA03"
SetField session, "wnd[0]/usr/ctxtVBAK-VBELN", orderNo
PressEnter session
If StatusType(session) = "E" Then
    WriteResult "Verification", "NG"
    Fail EXIT_VERIFY_FAILED, "受注 " & orderNo & " のVA03読み戻しに失敗: " & StatusText(session)
End If
Log "VA03読み戻しOK: 受注 " & orderNo
WriteResult "Verification", "OK"
AbortTransaction session

Succeed
