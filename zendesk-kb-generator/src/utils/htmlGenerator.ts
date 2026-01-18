import type { KBArticle, MultiLangText } from '../types/article';
import { generateSchemaOrg, generateEntityComments } from './schemaGenerator';

/**
 * 多言語テキストをHTMLに変換（言語フィルタリング対応）
 */
const renderMultiLangText = (text: MultiLangText, className: string = ''): string => {
  return `
    <div class="${className}">
      <span class="lang-all lang-en">${escapeHtml(text.en)}</span>
      <span class="lang-all lang-ja" style="display:none;">${escapeHtml(text.ja)}</span>
      <span class="lang-all lang-pt" style="display:none;">${escapeHtml(text.pt)}</span>
    </div>
  `.trim();
};

/**
 * HTMLエスケープ
 */
const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * PRADAスタイルCSSを生成
 */
const generateCSS = (): string => {
  return `
<style>
  /* PRADAスタイル Knowledge Base Article */
  .kb-article {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 13px;
    line-height: 1.8;
    color: #000000;
    background: #FFFFFF;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  .kb-header {
    border-bottom: 1px solid #000000;
    padding-bottom: 20px;
    margin-bottom: 20px;
  }

  .kb-title {
    font-size: 24px;
    text-transform: uppercase;
    letter-spacing: 5px;
    margin: 0 0 10px 0;
    font-weight: 400;
  }

  .kb-meta {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 3px;
    color: #666666;
  }

  .kb-summary {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
    margin-bottom: 30px;
  }

  @media (max-width: 1024px) {
    .kb-summary {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 768px) {
    .kb-summary {
      grid-template-columns: 1fr;
    }
  }

  .kb-summary-item {
    border: 1px solid #EEEEEE;
    padding: 20px;
    background: #F9F9F9;
  }

  .kb-summary-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 3px;
    margin-bottom: 10px;
    font-weight: 600;
  }

  .kb-summary-content {
    font-size: 13px;
    line-height: 1.8;
  }

  .kb-section {
    margin-bottom: 30px;
  }

  .kb-section-title {
    font-size: 16px;
    text-transform: uppercase;
    letter-spacing: 3px;
    margin-bottom: 15px;
    font-weight: 400;
  }

  .kb-two-column {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
  }

  @media (max-width: 1024px) {
    .kb-two-column {
      grid-template-columns: 1fr;
    }
  }

  .kb-process, .kb-faq-item {
    border: 1px solid #000000;
    margin-bottom: 10px;
  }

  .kb-process-header, .kb-faq-question {
    padding: 15px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #FFFFFF;
    transition: background 0.2s;
  }

  .kb-process-header:hover, .kb-faq-question:hover {
    background: #F9F9F9;
  }

  .kb-process-title, .kb-faq-q {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 3px;
  }

  .kb-process-icon, .kb-faq-icon {
    font-size: 20px;
    font-weight: 300;
  }

  .kb-process-content, .kb-faq-answer {
    padding: 15px;
    border-top: 1px solid #000000;
    display: none;
  }

  .kb-process.open .kb-process-content,
  .kb-faq-item.open .kb-faq-answer {
    display: block;
  }

  .kb-resources {
    border-top: 1px solid #EEEEEE;
    padding-top: 20px;
    margin-top: 30px;
  }

  .kb-resource-list {
    list-style: none;
    padding: 0;
    margin: 10px 0;
  }

  .kb-resource-list li {
    margin-bottom: 8px;
  }

  .kb-link {
    color: #000000;
    text-decoration: underline;
    transition: opacity 0.2s;
  }

  .kb-link:hover {
    opacity: 0.6;
  }

  .kb-footer {
    border-top: 1px solid #EEEEEE;
    padding-top: 20px;
    margin-top: 30px;
    font-size: 11px;
    color: #666666;
    text-align: center;
  }

  /* 言語切り替え */
  .kb-language-toggle {
    display: inline-flex;
    border: 1px solid #000000;
    margin-bottom: 20px;
  }

  .kb-lang-btn {
    padding: 8px 16px;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 3px;
    background: #FFFFFF;
    color: #000000;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }

  .kb-lang-btn:hover {
    background: #000000;
    color: #FFFFFF;
  }

  .kb-lang-btn.active {
    background: #000000;
    color: #FFFFFF;
  }

  /* 言語表示制御 */
  .lang-en, .lang-ja, .lang-pt, .lang-all {
    display: none;
  }

  .show-all .lang-all,
  .show-en .lang-en,
  .show-ja .lang-ja,
  .show-pt .lang-pt {
    display: inline;
  }
</style>
  `.trim();
};

/**
 * 言語切り替えJavaScriptを生成
 */
const generateJavaScript = (): string => {
  return `
<script>
(function() {
  // localStorage から言語設定を取得
  var currentLang = localStorage.getItem('kb-language') || 'all';

  // 言語切り替え関数
  function switchLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('kb-language', lang);

    var article = document.querySelector('.kb-article');
    article.className = 'kb-article show-' + lang;

    // ボタンのアクティブ状態を更新
    var buttons = document.querySelectorAll('.kb-lang-btn');
    buttons.forEach(function(btn) {
      btn.classList.remove('active');
      if (btn.dataset.lang === lang) {
        btn.classList.add('active');
      }
    });
  }

  // アコーディオントグル関数
  function toggleAccordion(element) {
    element.classList.toggle('open');
  }

  // DOMContentLoaded イベント
  document.addEventListener('DOMContentLoaded', function() {
    // 初期言語を設定
    switchLanguage(currentLang);

    // 言語切り替えボタンにイベントリスナーを追加
    var langButtons = document.querySelectorAll('.kb-lang-btn');
    langButtons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        switchLanguage(this.dataset.lang);
      });
    });

    // アコーディオンにイベントリスナーを追加
    var processHeaders = document.querySelectorAll('.kb-process-header');
    processHeaders.forEach(function(header) {
      header.addEventListener('click', function() {
        toggleAccordion(this.parentElement);
      });
    });

    var faqQuestions = document.querySelectorAll('.kb-faq-question');
    faqQuestions.forEach(function(question) {
      question.addEventListener('click', function() {
        toggleAccordion(this.parentElement);
      });
    });
  });

  // グローバルに公開
  window.KB = {
    switchLanguage: switchLanguage,
    toggleAccordion: toggleAccordion
  };
})();
</script>
  `.trim();
};

/**
 * Zendesk埋め込み用HTMLを生成
 */
export const generateZendeskHTML = (article: KBArticle): string => {
  const schemaOrg = generateSchemaOrg(article);
  const entityComments = generateEntityComments(article);

  // ヘッダー
  const header = `
<div class="kb-header">
  ${renderMultiLangText(article.title, 'kb-title')}
  <div class="kb-meta">
    <span>Category: ${escapeHtml(article.category)}</span> |
    <span>System: ${escapeHtml(article.system)}</span> |
    <span>Last Updated: ${escapeHtml(article.lastUpdated)}</span>
    ${article.relatedTicket ? ` | <span>Ticket: ${escapeHtml(article.relatedTicket)}</span>` : ''}
  </div>
</div>
  `.trim();

  // サマリー（4カラムグリッド）
  const summary = `
<div class="kb-summary">
  <div class="kb-summary-item">
    <div class="kb-summary-label">
      <span class="lang-all lang-en">Conclusion</span>
      <span class="lang-all lang-ja" style="display:none;">結論</span>
      <span class="lang-all lang-pt" style="display:none;">Conclusão</span>
    </div>
    ${renderMultiLangText(article.summary.conclusion, 'kb-summary-content')}
  </div>
  <div class="kb-summary-item">
    <div class="kb-summary-label">
      <span class="lang-all lang-en">Recommendation</span>
      <span class="lang-all lang-ja" style="display:none;">推奨事項</span>
      <span class="lang-all lang-pt" style="display:none;">Recomendação</span>
    </div>
    ${renderMultiLangText(article.summary.recommendation, 'kb-summary-content')}
  </div>
  <div class="kb-summary-item">
    <div class="kb-summary-label">
      <span class="lang-all lang-en">Timeline</span>
      <span class="lang-all lang-ja" style="display:none;">タイムライン</span>
      <span class="lang-all lang-pt" style="display:none;">Cronograma</span>
    </div>
    ${renderMultiLangText(article.summary.timeline, 'kb-summary-content')}
  </div>
  <div class="kb-summary-item">
    <div class="kb-summary-label">
      <span class="lang-all lang-en">Risk Level</span>
      <span class="lang-all lang-ja" style="display:none;">リスクレベル</span>
      <span class="lang-all lang-pt" style="display:none;">Nível de Risco</span>
    </div>
    ${renderMultiLangText(article.summary.riskLevel, 'kb-summary-content')}
  </div>
</div>
  `.trim();

  // プロセス
  const processes = article.processes.length > 0 ? `
<div class="kb-section">
  <h2 class="kb-section-title">
    <span class="lang-all lang-en">Processes / Procedures</span>
    <span class="lang-all lang-ja" style="display:none;">プロセス / 手順</span>
    <span class="lang-all lang-pt" style="display:none;">Processos / Procedimentos</span>
  </h2>
  ${article.processes.map((process) => `
    <div class="kb-process">
      <div class="kb-process-header">
        ${renderMultiLangText(process.title, 'kb-process-title')}
        <span class="kb-process-icon">+</span>
      </div>
      <div class="kb-process-content">
        ${renderMultiLangText(process.content, '')}
      </div>
    </div>
  `).join('\n')}
</div>
  `.trim() : '';

  // FAQ
  const faqs = article.faqs.length > 0 ? `
<div class="kb-section">
  <h2 class="kb-section-title">
    <span class="lang-all lang-en">Frequently Asked Questions</span>
    <span class="lang-all lang-ja" style="display:none;">よくある質問</span>
    <span class="lang-all lang-pt" style="display:none;">Perguntas Frequentes</span>
  </h2>
  ${article.faqs.map((faq) => `
    <div class="kb-faq-item">
      <div class="kb-faq-question">
        ${renderMultiLangText(faq.question, 'kb-faq-q')}
        <span class="kb-faq-icon">+</span>
      </div>
      <div class="kb-faq-answer">
        ${renderMultiLangText(faq.answer, '')}
      </div>
    </div>
  `).join('\n')}
</div>
  `.trim() : '';

  // リソース
  const resources = (article.resources.links.length > 0 ||
                      article.resources.emails.length > 0 ||
                      article.resources.relatedArticles.length > 0) ? `
<div class="kb-resources">
  <h2 class="kb-section-title">
    <span class="lang-all lang-en">Additional Resources</span>
    <span class="lang-all lang-ja" style="display:none;">追加リソース</span>
    <span class="lang-all lang-pt" style="display:none;">Recursos Adicionais</span>
  </h2>

  ${article.resources.links.length > 0 ? `
    <div class="kb-resource-section">
      <h3 class="kb-summary-label">
        <span class="lang-all lang-en">Links</span>
        <span class="lang-all lang-ja" style="display:none;">リンク</span>
        <span class="lang-all lang-pt" style="display:none;">Links</span>
      </h3>
      <ul class="kb-resource-list">
        ${article.resources.links.map(link => `
          <li>
            <a href="${escapeHtml(link.url)}" class="kb-link" target="_blank" rel="noopener noreferrer">
              ${renderMultiLangText(link.label, '')}
            </a>
          </li>
        `).join('\n')}
      </ul>
    </div>
  ` : ''}

  ${article.resources.emails.length > 0 ? `
    <div class="kb-resource-section">
      <h3 class="kb-summary-label">
        <span class="lang-all lang-en">Email Contacts</span>
        <span class="lang-all lang-ja" style="display:none;">メール連絡先</span>
        <span class="lang-all lang-pt" style="display:none;">Contatos de Email</span>
      </h3>
      <ul class="kb-resource-list">
        ${article.resources.emails.map(email => `
          <li><a href="mailto:${escapeHtml(email)}" class="kb-link">${escapeHtml(email)}</a></li>
        `).join('\n')}
      </ul>
    </div>
  ` : ''}

  ${article.resources.relatedArticles.length > 0 ? `
    <div class="kb-resource-section">
      <h3 class="kb-summary-label">
        <span class="lang-all lang-en">Related Articles</span>
        <span class="lang-all lang-ja" style="display:none;">関連記事</span>
        <span class="lang-all lang-pt" style="display:none;">Artigos Relacionados</span>
      </h3>
      <ul class="kb-resource-list">
        ${article.resources.relatedArticles.map(articleId => `
          <li>${escapeHtml(articleId)}</li>
        `).join('\n')}
      </ul>
    </div>
  ` : ''}
</div>
  `.trim() : '';

  // 2カラムレイアウト（プロセスとFAQ）
  const twoColumnContent = (processes || faqs) ? `
<div class="kb-two-column">
  ${processes ? `<div>${processes}</div>` : ''}
  ${faqs ? `<div>${faqs}</div>` : ''}
</div>
  `.trim() : '';

  // フッター
  const footer = `
<div class="kb-footer">
  <p>Article ID: ${escapeHtml(article.id)}</p>
  <p>© ${new Date().getFullYear()} ${escapeHtml(article.system)}</p>
</div>
  `.trim();

  // 最終的なHTML
  return `
<!-- Schema.org Structured Data -->
<script type="application/ld+json">
${schemaOrg}
</script>

${entityComments}

${generateCSS()}

<div class="kb-article show-all">
  <!-- Language Toggle -->
  <div class="kb-language-toggle">
    <button class="kb-lang-btn active" data-lang="all">All Languages</button>
    <button class="kb-lang-btn" data-lang="en">English</button>
    <button class="kb-lang-btn" data-lang="ja">日本語</button>
    <button class="kb-lang-btn" data-lang="pt">Português</button>
  </div>

  ${header}
  ${summary}
  ${twoColumnContent || processes || faqs}
  ${resources}
  ${footer}
</div>

${generateJavaScript()}
  `.trim();
};

/**
 * ファイル名を生成
 */
export const generateFileName = (article: KBArticle): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  return `KB_${article.id}_${timestamp}.html`;
};
