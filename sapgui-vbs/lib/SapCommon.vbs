' ============================================================
' SapCommon.vbs - SAP GUIスクリプティング共通ライブラリ
'
' 各取引スクリプトから ExecuteGlobal で読み込んで使う。
' Power Automate Desktop から呼ばれる前提の規約:
'   - 入力: 名前付き引数 (cscript script.vbs /BUKRS:1000 /LIFNR:100001 ...)
'   - 出力: 終了コード (0=成功 1=入力エラー 2=SAPエラー 3=接続不可 4=検証NG)
'           結果ファイル logs\<script>_<runid>.result.txt (Key=Value形式)
'           ログファイル logs\<script>_<runid>.log
'   - 資格情報は扱わない。ログオン済みSAP GUIセッションにアタッチする
' ============================================================
Option Explicit

' 終了コード契約
Const EXIT_OK = 0
Const EXIT_INPUT_ERROR = 1
Const EXIT_SAP_ERROR = 2
Const EXIT_NO_SESSION = 3
Const EXIT_VERIFY_FAILED = 4

Dim gFso, gRunId, gLogPath, gResultPath, gScriptName
Set gFso = CreateObject("Scripting.FileSystemObject")

' ------------------------------------------------------------
' 初期化: ログ/結果ファイルの準備
' ------------------------------------------------------------
Sub InitRun(scriptName)
    Dim logDir
    gScriptName = scriptName
    gRunId = Year(Now) & Right("0" & Month(Now), 2) & Right("0" & Day(Now), 2) & "_" & _
             Right("0" & Hour(Now), 2) & Right("0" & Minute(Now), 2) & Right("0" & Second(Now), 2)
    logDir = gFso.GetParentFolderName(gFso.GetParentFolderName(WScript.ScriptFullName)) & "\logs"
    If Not gFso.FolderExists(logDir) Then gFso.CreateFolder logDir
    gLogPath = logDir & "\" & scriptName & "_" & gRunId & ".log"
    gResultPath = logDir & "\" & scriptName & "_" & gRunId & ".result.txt"
    WriteResult "RunId", gRunId
    WriteResult "Script", scriptName
    Log "=== " & scriptName & " 開始 (RunId=" & gRunId & ") ==="
End Sub

Sub Log(msg)
    Dim f
    Set f = gFso.OpenTextFile(gLogPath, 8, True)
    f.WriteLine Now & "  " & msg
    f.Close
End Sub

Sub WriteResult(key, value)
    Dim f
    Set f = gFso.OpenTextFile(gResultPath, 8, True)
    f.WriteLine key & "=" & value
    f.Close
End Sub

' 異常終了: 理由を記録してPADへ終了コードを返す
Sub Fail(exitCode, msg)
    Log "FAIL(" & exitCode & "): " & msg
    WriteResult "Status", "ERROR"
    WriteResult "ExitCode", exitCode
    WriteResult "Message", msg
    WScript.Echo "ERROR: " & msg
    WScript.Quit exitCode
End Sub

' ------------------------------------------------------------
' 引数 (PADからの変数受け渡し)
' ------------------------------------------------------------
Function GetArg(name, required, defaultValue)
    If WScript.Arguments.Named.Exists(name) Then
        GetArg = WScript.Arguments.Named(name)
    ElseIf required Then
        Fail EXIT_INPUT_ERROR, "必須引数 /" & name & ": が指定されていません"
    Else
        GetArg = defaultValue
    End If
End Function

' 入力検証ヘルパ (SAPに触る前に落とす)
Sub AssertNumeric(name, value)
    If Not IsNumeric(Replace(value, ",", "")) Then
        Fail EXIT_INPUT_ERROR, name & " が数値ではありません: " & value
    End If
End Sub

Sub AssertDate(name, value) ' 期待形式: YYYYMMDD
    If Len(value) <> 8 Or Not IsNumeric(value) Then
        Fail EXIT_INPUT_ERROR, name & " はYYYYMMDD形式で指定してください: " & value
    End If
End Sub

' ------------------------------------------------------------
' SAP GUI接続
' ------------------------------------------------------------
Function AttachSession()
    Dim sapGuiAuto, app, connection, session, connIdx, sessIdx
    connIdx = CInt(GetArg("ConnIndex", False, "0"))
    sessIdx = CInt(GetArg("SessIndex", False, "0"))

    On Error Resume Next
    Set sapGuiAuto = GetObject("SAPGUI")
    If Err.Number <> 0 Then
        On Error GoTo 0
        Fail EXIT_NO_SESSION, "SAP GUIが起動していません (GetObject SAPGUI 失敗)"
    End If
    Set app = sapGuiAuto.GetScriptingEngine
    If Err.Number <> 0 Or app.Children.Count = 0 Then
        On Error GoTo 0
        Fail EXIT_NO_SESSION, "ログオン済みのSAP接続がありません (RZ11 sapgui/user_scripting を確認)"
    End If
    Set connection = app.Children(connIdx)
    Set session = connection.Children(sessIdx)
    If Err.Number <> 0 Then
        On Error GoTo 0
        Fail EXIT_NO_SESSION, "セッション取得に失敗 (Conn=" & connIdx & " Sess=" & sessIdx & ")"
    End If
    On Error GoTo 0

    Log "セッション接続: システム=" & session.Info.SystemName & _
        " クライアント=" & session.Info.Client & " ユーザ=" & session.Info.User
    WriteResult "System", session.Info.SystemName
    Set AttachSession = session
End Function

' ------------------------------------------------------------
' 画面操作の基本 (全操作をログに残す)
' ------------------------------------------------------------
Function FieldExists(session, id)
    Dim obj
    On Error Resume Next
    Set obj = session.FindById(id)
    FieldExists = (Err.Number = 0)
    Err.Clear
    On Error GoTo 0
End Function

Sub SetField(session, id, value)
    If Not FieldExists(session, id) Then
        Fail EXIT_SAP_ERROR, "画面項目が見つかりません: " & id & vbCrLf & _
             "→ Script Recording (Alt+F12) で対象環境のIDを記録して差し替えてください"
    End If
    session.FindById(id).Text = value
    Log "SET " & id & " = " & value
End Sub

Sub PressEnter(session)
    session.FindById("wnd[0]").SendVKey 0
    Log "KEY Enter"
End Sub

Sub PressF8(session)
    session.FindById("wnd[0]").SendVKey 8
    Log "KEY F8 (実行)"
End Sub

Sub PressSave(session)
    session.FindById("wnd[0]/tbar[0]/btn[11]").Press
    Log "BTN 保存 (Ctrl+S)"
End Sub

Sub StartTcode(session, tcode)
    session.FindById("wnd[0]/tbar[0]/okcd").Text = "/n" & tcode
    session.FindById("wnd[0]").SendVKey 0
    Log "TCODE /n" & tcode
End Sub

' ------------------------------------------------------------
' ステータスバー / ポップアップ
' ------------------------------------------------------------
Function StatusType(session)
    StatusType = session.FindById("wnd[0]/sbar").MessageType ' S/W/E/A/I
End Function

Function StatusText(session)
    StatusText = session.FindById("wnd[0]/sbar").Text
End Function

' 警告ポップアップ (wnd[1]) をEnterで送る。最大maxCount回。
' 注意: エラー内容を握り潰さないよう、閉じる前に必ず本文をログへ残す
Sub DismissWarningPopups(session, maxCount)
    Dim i, popupText
    For i = 1 To maxCount
        If FieldExists(session, "wnd[1]") Then
            popupText = ""
            On Error Resume Next
            popupText = session.FindById("wnd[1]").Text
            On Error GoTo 0
            Log "POPUP wnd[1]: " & popupText & " → Enter"
            session.FindById("wnd[1]").SendVKey 0
        End If
    Next
End Sub

' ステータスバーのメッセージから伝票/受注番号 (連続数字) を抽出
Function ExtractDocNumber(text)
    Dim re, matches
    Set re = New RegExp
    re.Pattern = "\d{6,}"
    re.Global = False
    Set matches = re.Execute(text)
    If matches.Count > 0 Then
        ExtractDocNumber = matches(0).Value
    Else
        ExtractDocNumber = ""
    End If
End Function

' 転記後の共通処理: ステータス確認→番号抽出。失敗時はそのままFail
Function ConfirmPosting(session, docLabel)
    Dim sType, sText, docNo
    DismissWarningPopups session, 3
    sType = StatusType(session)
    sText = StatusText(session)
    Log "STATUS [" & sType & "] " & sText
    WriteResult "StatusMessage", sText
    If sType = "E" Or sType = "A" Then
        Fail EXIT_SAP_ERROR, "SAPエラー: " & sText
    End If
    docNo = ExtractDocNumber(sText)
    If docNo = "" Then
        Fail EXIT_SAP_ERROR, docLabel & "番号をステータスバーから取得できません: " & sText
    End If
    WriteResult docLabel, docNo
    Log docLabel & " = " & docNo
    ConfirmPosting = docNo
End Function

' 画面を初期状態へ戻す (未保存データ破棄の確認ポップアップにも対応)
Sub AbortTransaction(session)
    session.FindById("wnd[0]/tbar[0]/okcd").Text = "/n"
    session.FindById("wnd[0]").SendVKey 0
    If FieldExists(session, "wnd[1]/usr/btnSPOP-OPTION1") Then
        session.FindById("wnd[1]/usr/btnSPOP-OPTION1").Press ' はい (データ破棄)
    End If
    Log "TCODE /n (トランザクション中断)"
End Sub

' 正常終了
Sub Succeed()
    WriteResult "Status", "OK"
    WriteResult "ExitCode", EXIT_OK
    Log "=== 正常終了 ==="
    WScript.Echo "OK: " & gResultPath
    WScript.Quit EXIT_OK
End Sub
