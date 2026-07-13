# ROI Calculator — ROI計算テンプレート

用途: Discovery Call中のライブ試算 / 提案書のROIセクション / 導入後の実測比較。
実体はスプレッドシート (Google Sheets)。本書はその仕様と計算式の正。

## 入力 (6問に対応)

| # | 入力項目 | 変数 | 例 |
|---|---|---|---|
| 1 | 1回あたりの所要時間 (分) | `minutes_per_run` | 30 |
| 2 | 月間実行回数 | `runs_per_month` | 80 |
| 3 | 実行者の時給 (USD, 福利厚生込み=給与×1.3目安) | `hourly_cost` | 50 |
| 4 | 月間エラー件数 | `errors_per_month` | 4 |
| 5 | エラー1件の処理コスト (USD, 調査+修正+影響) | `cost_per_error` | 150 |
| 6 | 自動化率 (自動化後に残る手作業を引いた割合) | `automation_rate` | 0.8 |

導入費用側: `sprint_price` (15,000 or 25,000) / `support_monthly` (3,000〜) /
`assessment_price` (3,000 — Sprint受注時は0として扱う)

## 計算式

```
月間工数コスト   monthly_labor  = minutes_per_run × runs_per_month ÷ 60 × hourly_cost
月間エラーコスト monthly_error  = errors_per_month × cost_per_error
月間削減額      monthly_saving = (monthly_labor + monthly_error) × automation_rate
純月間削減額    net_monthly    = monthly_saving − support_monthly
年間純削減額    annual_net     = net_monthly × 12
回収期間(月)    payback_months = sprint_price ÷ net_monthly
初年度ROI       roi_year1      = (annual_net − sprint_price) ÷ sprint_price
削減時間(月)    hours_saved    = minutes_per_run × runs_per_month ÷ 60 × automation_rate
```

## 計算例 (提案書の標準例)

入力: 30分 × 80回/月、時給$50、エラー4件×$150、自動化率80%、
Sprint $15,000、保守 $3,000/月

```
monthly_labor  = 30 × 80 ÷ 60 × 50        = $2,000
monthly_error  = 4 × 150                   = $600
monthly_saving = (2,000 + 600) × 0.8       = $2,080
net_monthly    = 2,080 − 3,000             = −$920  ← 保守Basicでは赤字!
```

この例 (月40時間) の保守別回収 = 15,000 ÷ 2,080 = **約7ヶ月**。

**重要な学び**: 月間削減額が$3,000 (Basic保守費) 未満の業務は、保守込みでは
黒字化しない。→ 保守込み黒字の目安は**月60時間超の削減 or 高いエラーコスト**。
それ未満の案件では**「保守別」で回収を語り、保守は保険・改善枠として別建てで
価値説明**する。提案書には「保守込み」「保守別」の2行を必ず併記する。
対象業務の下限ライン: 月20時間以上 or エラーコストが大きい業務 (ICP §4と整合)。

## 感度分析 (提案書に載せる3シナリオ)

| シナリオ | automation_rate | 提示意図 |
|---|---|---|
| 保守的 | 60% | 最低でもこれだけ削減 |
| 標準 | 80% | 提案の基準値 |
| 上振れ | 90% + 対象業務追加 | 継続時の伸び代 |

## スプレッドシート構成 (Google Sheets)

- Sheet1 `Calculator`: 入力セル (黄色) → 出力 (自動計算・保護)
- Sheet2 `Scenarios`: 3シナリオ比較表 (提案書へコピー用)
- Sheet3 `Actuals`: 導入後の実測記録 (月次レポートで試算と比較 → 更新・アップセルの根拠)

## 運用ルール

1. 数字はすべて**顧客の自己申告**を使い、出典 (誰がいつ言ったか) をメモ欄に残す
2. 時給が不明なら「役職の一般水準×1.3」を使い、前提として明記
3. 過大に見せない: automation_rate 100%を使わない / 定性効果 (士気・離職) は金額化せず文章で添える
4. 導入後3ヶ月目に実測値でこのシートを更新し、月次レポートに載せる
