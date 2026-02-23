import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記",
};

export default function TokushohoPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-8 text-2xl font-bold">特定商取引法に基づく表記</h1>

      <div className="space-y-8 text-sm leading-relaxed text-foreground/90">
        <section>
          <h2 className="mb-3 text-base font-semibold">販売業者</h2>
          <p>個人事業主 ［氏名を記載してください］</p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold">運営統括責任者</h2>
          <p>［氏名を記載してください］</p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold">所在地</h2>
          <p>
            請求があった場合には遅滞なく開示いたします。
            <br />
            お問い合わせ先メールアドレスまでご連絡ください。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold">連絡先</h2>
          <p>
            メールアドレス: support@clipforge.app
            <br />
            ※お問い合わせはメールにてお願いいたします。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold">販売価格</h2>
          <p>
            各プランの料金は、サービス内の料金ページに表示された金額に準じます。
            <br />
            すべて税込価格で表示しております。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold">
            販売価格以外にお客様が負担する費用
          </h2>
          <p>
            インターネット接続に必要な通信料はお客様のご負担となります。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold">支払方法</h2>
          <p>クレジットカード決済（Stripe を通じた決済）</p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold">支払時期</h2>
          <p>
            サブスクリプション契約時に初回決済が行われます。
            <br />
            以降、契約期間に応じて自動的に決済されます。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold">サービスの提供時期</h2>
          <p>決済完了後、直ちにサービスをご利用いただけます。</p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold">
            キャンセル・解約について
          </h2>
          <p>
            サブスクリプションはいつでもマイページから解約できます。
            <br />
            解約後も、現在の請求期間の終了まではサービスをご利用いただけます。
            <br />
            デジタルコンテンツの性質上、生成済みの動画に対する返金は行っておりません。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold">動作環境</h2>
          <p>
            最新版の Google Chrome / Safari / Firefox / Microsoft Edge
            <br />
            インターネット接続が必要です。
          </p>
        </section>
      </div>
    </div>
  );
}
