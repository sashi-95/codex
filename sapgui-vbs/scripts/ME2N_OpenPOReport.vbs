' ============================================================
' ME2N_OpenPOReport.vbs - 発注一覧照会→ローカルファイル出力 (MM / リスクL0)
'
' 未消込PO・納期遅延の定例レポート。読み取りのみ。
' FBL1Nと同じ「選択画面→F8→ローカルファイル出力」パターン。
'
' PADからの呼び出し例:
'   cscript //Nologo ME2N_OpenPOReport.vbs ^
'     /EKORG:1000 /LIFNR:100001 /SELPA:WE101 ^
'     /OUTDIR:C:\bot\out /OUTFILE:me2n_open.txt
'
' 変数:
'   EKORG  購買組織              LIFNR  仕入先 (任意)
'   SELPA  選択パラメータ (任意。WE101=入庫予定オープン等、環境の定義に従う)
'   OUTDIR 出力フォルダ           OUTFILE 出力ファイル名
' ============================================================
Option Explicit

Dim fsoBoot: Set fsoBoot = CreateObject("Scripting.FileSystemObject")
ExecuteGlobal fsoBoot.OpenTextFile( _
    fsoBoot.GetParentFolderName(fsoBoot.GetParentFolderName(WScript.ScriptFullName)) & "\lib\SapCommon.vbs", 1).ReadAll

InitRun "ME2N"

Dim EKORG, LIFNR, SELPA, OUTDIR, OUTFILE
EKORG = GetArg("EKORG", True, "")
LIFNR = GetArg("LIFNR", False, "")
SELPA = GetArg("SELPA", False, "")
OUTDIR = GetArg("OUTDIR", True, "")
OUTFILE = GetArg("OUTFILE", True, "")

Dim session: Set session = AttachSession()
StartTcode session, "ME2N"

' ---- 選択画面 ----
SetField session, "wnd[0]/usr/ctxtEKORG", EKORG
If LIFNR <> "" Then SetField session, "wnd[0]/usr/ctxtEL_LIFNR-LOW", LIFNR
If SELPA <> "" Then SetField session, "wnd[0]/usr/ctxtSELPA", SELPA

PressF8 session
If StatusType(session) = "E" Then
    Fail EXIT_SAP_ERROR, "照会実行エラー: " & StatusText(session)
End If

' ---- ローカルファイル出力 (ALV) ----
If FieldExists(session, "wnd[0]/tbar[1]/btn[45]") Then
    session.FindById("wnd[0]/tbar[1]/btn[45]").Press
Else
    session.FindById("wnd[0]/mbar/menu[0]/menu[3]/menu[1]").Select
End If
If FieldExists(session, "wnd[1]/usr/subSUBSCREEN_STEPLOOP:SAPLSPO5:0150/sub:SAPLSPO5:0150/radSPOPLI-SELFLAG[1,0]") Then
    session.FindById("wnd[1]/usr/subSUBSCREEN_STEPLOOP:SAPLSPO5:0150/sub:SAPLSPO5:0150/radSPOPLI-SELFLAG[1,0]").Select
    session.FindById("wnd[1]").SendVKey 0
End If
SetField session, "wnd[1]/usr/ctxtDY_PATH", OUTDIR
SetField session, "wnd[1]/usr/ctxtDY_FILENAME", OUTFILE
session.FindById("wnd[1]/tbar[0]/btn[11]").Press

If Not gFso.FileExists(OUTDIR & "\" & OUTFILE) Then
    Fail EXIT_VERIFY_FAILED, "出力ファイルが生成されていません: " & OUTDIR & "\" & OUTFILE
End If
WriteResult "OutFile", OUTDIR & "\" & OUTFILE

AbortTransaction session
Succeed
