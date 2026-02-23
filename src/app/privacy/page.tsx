import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-2 text-2xl font-bold">プライバシーポリシー</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        最終更新日: 2026年2月24日
      </p>

      <div className="space-y-8 text-sm leading-relaxed text-foreground/90">
        <section>
          <h2 className="mb-3 text-base font-semibold">1. はじめに</h2>
          <p>
            ClipForge（以下「本サービス」）は、ユーザーのプライバシーを尊重し、
            個人情報の保護に努めます。本ポリシーでは、収集する情報の種類、
            利用目的、管理方法について説明します。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold">
            2. 収集する情報
          </h2>
          <h3 className="mb-2 mt-3 text-sm font-medium">
            2.1 アカウント情報
          </h3>
          <ul className="list-inside list-disc space-y-1">
            <li>メールアドレス（ログイン認証用）</li>
            <li>認証プロバイダーから提供される表示名・プロフィール画像</li>
          </ul>

          <h3 className="mb-2 mt-3 text-sm font-medium">
            2.2 アップロードデータ
          </h3>
          <ul className="list-inside list-disc space-y-1">
            <li>ユーザーがアップロードした商品画像</li>
            <li>生成された動画データ</li>
          </ul>

          <h3 className="mb-2 mt-3 text-sm font-medium">
            2.3 利用情報
          </h3>
          <ul className="list-inside list-disc space-y-1">
            <li>サービスの利用状況（生成回数、テンプレート選択など）</li>
            <li>アクセスログ（IPアドレス、ブラウザ情報、アクセス日時）</li>
          </ul>

          <h3 className="mb-2 mt-3 text-sm font-medium">
            2.4 決済情報
          </h3>
          <p>
            クレジットカード情報はStripe社が直接処理し、
            本サービスのサーバーには保存されません。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold">
            3. 情報の利用目的
          </h2>
          <ul className="list-inside list-disc space-y-1">
            <li>本サービスの提供・運営・改善</li>
            <li>ユーザー認証およびアカウント管理</li>
            <li>料金の請求処理</li>
            <li>サービスに関するお知らせの送信</li>
            <li>不正利用の防止</li>
            <li>匿名化された統計データの分析</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold">
            4. 第三者への提供
          </h2>
          <p>以下の場合を除き、個人情報を第三者に提供しません。</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>ユーザーの同意がある場合</li>
            <li>法令に基づく開示要請があった場合</li>
            <li>
              サービス運営に必要な業務委託先（以下に限定）:
              <ul className="ml-4 mt-1 list-inside list-disc space-y-1">
                <li>Supabase（認証・データベース・ストレージ）</li>
                <li>Stripe（決済処理）</li>
                <li>BytePlus / Seedance（AI動画生成）</li>
                <li>Vercel（ホスティング）</li>
              </ul>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold">
            5. データの保管・削除
          </h2>
          <ol className="list-inside list-decimal space-y-2">
            <li>
              アップロードされた画像は、動画生成処理に必要な期間のみ保管します。
            </li>
            <li>
              生成された動画は、ユーザーのアカウントが有効な間保管されます。
            </li>
            <li>
              アカウント削除を希望する場合は、お問い合わせください。
              関連するすべてのデータを速やかに削除いたします。
            </li>
          </ol>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold">
            6. Cookieの使用
          </h2>
          <p>
            本サービスでは、認証状態の維持のためにCookieを使用しています。
            ブラウザの設定によりCookieを無効にできますが、
            一部の機能が利用できなくなる場合があります。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold">
            7. セキュリティ
          </h2>
          <p>
            個人情報の保護のため、SSL/TLS暗号化通信、
            アクセス制御、データベースの行レベルセキュリティ（RLS）
            などの技術的措置を講じています。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold">
            8. ポリシーの変更
          </h2>
          <p>
            本ポリシーは必要に応じて改定する場合があります。
            重要な変更がある場合は、サービス上でお知らせします。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold">
            9. お問い合わせ
          </h2>
          <p>
            プライバシーに関するお問い合わせは、以下までご連絡ください。
            <br />
            メールアドレス: support@clipforge.app
          </p>
        </section>
      </div>
    </div>
  );
}
