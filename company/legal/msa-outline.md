# Master Service Agreement — MSA構成案

> ⚠️ 構成案 (条文ドラフトではない)。**MSA本文は弁護士に起草を依頼**し、
> 本書はその指示書として使う。
> 使い分け: 単発Sprint 1件のみ → SOW単体で可 (sow-template.mdに必要条項を内包済み)。
> 保守契約や複数SOWが見込まれる顧客 → MSA + 個別SOW方式に切り替える。

## MSAに含める条項と、当社側の要件

| # | 条項 | 当社の要件 (弁護士への指示) |
|---|---|---|
| 1 | Definitions / Structure | MSA=共通条件、SOW=個別条件。矛盾時はSOW優先 |
| 2 | Services & SOW発行手続 | SOWは両者署名で発効。メール承認の効力も規定 |
| 3 | Fees & Payment | 前金要件・期日15日・遅延利息・保守の自動更新 (月次) と価格改定通知30日 |
| 4 | Client Responsibilities | アクセス提供・担当者協力。**提供遅延は納期加算 (料金不変)** |
| 5 | Acceptance | UAT手続と「5営業日無通知=みなし検収」 |
| 6 | Data Protection & Security | データ分離・最小権限・ログ・削除証明。**AI/MLサービスへの送信は書面合意の範囲のみ+学習不使用設定** (NDA §4と整合) |
| 7 | Confidentiality | NDA締結済みならNDAを参照統合 |
| 8 | Intellectual Property | 成果物=支払完了でClient帰属 / Pre-existing IP=当社留保+利用ライセンス / **匿名化知見の再利用権** (事業モデルの生命線。SOW §9と同一文言) |
| 9 | Warranty | リリース後30日の適合保証。第三者システム (SAP/Zendesk等) の変更起因は対象外 |
| 10 | Support SLA (保守顧客向け別紙) | 対応時間 (営業時間内)・初動時間 (Basic: 8営業時間 / Premium: 4営業時間)・エスカレーション手順 |
| 11 | Limitation of Liability | 上限=直近12ヶ月の支払額。間接損害免責。データ侵害時の例外は弁護士判断 |
| 12 | Indemnification | 相互。第三者IP侵害は当社、Client提供データの権利は顧客 |
| 13 | Insurance | E&O・サイバー保険の付保額を記載 (加入後) |
| 14 | Term & Termination | 便宜解約30日通知。未払い時の作業停止権。終了時のデータ削除・引き継ぎ協力 |
| 15 | Independent Contractor | 雇用関係の否定 (1人会社のため特に明確に) |
| 16 | Subcontracting | 事前通知で外部委託可 (M4以降の委託分離に必須)。守秘・品質は当社責任 |
| 17 | Force Majeure / Notices / Assignment / Entire Agreement | 標準条項 |
| 18 | Governing Law | NY州法・NY管轄 (顧客が強く求める場合の代替はDE) |

## 弁護士依頼時のパッケージ

1. 本構成案 + sow-template.md + nda-draft.md
2. 事業説明1枚 (サービス内容・価格・データの流れ)
3. 予算目安: $2,000-4,000 (MSA+SOW+NDAの3点セットレビュー) — Issue #7
