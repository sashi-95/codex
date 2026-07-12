' ============================================================
' FBL1N_VendorLineItems.vbs - 仕入先明細照会→ローカルファイル出力 (FI / リスクL0)
'
' 支払予定・残高確認の定例レポート。読み取りのみで安全なため、
' PADスケジュール実行の第1段として最適。
'
' PADからの呼び出し例:
'   cscript //Nologo FBL1N_VendorLineItems.vbs ^
'     /BUKRS:1000 /LIFNR_FROM:100000 /LIFNR_TO:199999 ^
'     /STIDA:20260712 /OUTDIR:C:\bot\out /OUTFILE:fbl1n_open.txt
'
' 変数:
'   BUKRS       会社コード
'   LIFNR_FROM  仕入先コード(From)   LIFNR_TO  仕入先コード(To, 任意)
'   STIDA       オープン明細の基準日 (YYYYMMDD)
'   OUTDIR      出力フォルダ          OUTFILE   出力ファイル名
' ============================================================
Option Explicit

Dim fsoBoot: Set fsoBoot = CreateObject("Scripting.FileSystemObject")
ExecuteGlobal fsoBoot.OpenTextFile( _
    fsoBoot.GetParentFolderName(fsoBoot.GetParentFolderName(WScript.ScriptFullName)) & "\lib\SapCommon.vbs", 1).ReadAll

InitRun "FBL1N"

Dim BUKRS, LIFNR_FROM, LIFNR_TO, STIDA, OUTDIR, OUTFILE
BUKRS = GetArg("BUKRS", True, "")
LIFNR_FROM = GetArg("LIFNR_FROM", True, "")
LIFNR_TO = GetArg("LIFNR_TO", False, "")
STIDA = GetArg("STIDA", True, "")
OUTDIR = GetArg("OUTDIR", True, "")
OUTFILE = GetArg("OUTFILE", True, "")
AssertDate "STIDA", STIDA

Dim session: Set session = AttachSession()
StartTcode session, "FBL1N"

' ---- 選択画面 ----
SetField session, "wnd[0]/usr/ctxtDD_LIFNR-LOW", LIFNR_FROM
If LIFNR_TO <> "" Then SetField session, "wnd[0]/usr/ctxtDD_LIFNR-HIGH", LIFNR_TO
SetField session, "wnd[0]/usr/ctxtDD_BUKRS-LOW", BUKRS
' オープン明細 + 基準日
If FieldExists(session, "wnd[0]/usr/radX_OPSEL") Then
    session.FindById("wnd[0]/usr/radX_OPSEL").Select
    Log "SELECT オープン明細"
End If
SetField session, "wnd[0]/usr/ctxtPA_STIDA", Mid(STIDA, 5, 2) & "/" & Mid(STIDA, 7, 2) & "/" & Left(STIDA, 4)

' ---- 実行 (F8) ----
PressF8 session
If StatusType(session) = "E" Then
    Fail EXIT_SAP_ERROR, "照会実行エラー: " & StatusText(session)
End If
' 「該当データなし」は正常系として扱い、空ファイルの生成をPAD側に伝える
If InStr(StatusText(session), "選択され") > 0 Or InStr(StatusText(session), "not select") > 0 Then
    WriteResult "RowCount", "0"
    WriteResult "OutFile", ""
    Log "該当明細なし: " & StatusText(session)
    Succeed
End If

' ---- ローカルファイル出力 (ALVツールバー: ローカルファイル) ----
' ボタンIDは環境依存 (btn[45]が一般的)。Alt+F12で記録して確認すること。
If FieldExists(session, "wnd[0]/tbar[1]/btn[45]") Then
    session.FindById("wnd[0]/tbar[1]/btn[45]").Press
Else
    ' メニュー経由: システム → リスト → 保存 → ローカルファイル
    session.FindById("wnd[0]/mbar/menu[0]/menu[3]/menu[1]").Select
End If
Log "ローカルファイル出力ダイアログを起動"

' 形式選択ポップアップ (未変換 / 表計算)
If FieldExists(session, "wnd[1]/usr/subSUBSCREEN_STEPLOOP:SAPLSPO5:0150/sub:SAPLSPO5:0150/radSPOPLI-SELFLAG[1,0]") Then
    session.FindById("wnd[1]/usr/subSUBSCREEN_STEPLOOP:SAPLSPO5:0150/sub:SAPLSPO5:0150/radSPOPLI-SELFLAG[1,0]").Select
    session.FindById("wnd[1]").SendVKey 0
    Log "形式: 表計算を選択"
End If

' パス・ファイル名
SetField session, "wnd[1]/usr/ctxtDY_PATH", OUTDIR
SetField session, "wnd[1]/usr/ctxtDY_FILENAME", OUTFILE
session.FindById("wnd[1]/tbar[0]/btn[11]").Press ' 置換して生成
Log "OUTPUT " & OUTDIR & "\" & OUTFILE

' ---- 出力ファイルの存在確認 (読み取り系の検証) ----
If Not gFso.FileExists(OUTDIR & "\" & OUTFILE) Then
    Fail EXIT_VERIFY_FAILED, "出力ファイルが生成されていません: " & OUTDIR & "\" & OUTFILE
End If
WriteResult "OutFile", OUTDIR & "\" & OUTFILE

AbortTransaction session
Succeed
