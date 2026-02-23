import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "利用規約",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-2 text-2xl font-bold">利用規約</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        最終更新日: 2026年2月24日
      </p>

      <div className="space-y-8 text-sm leading-relaxed text-foreground/90">
        <section>
          <h2 className="mb-3 text-base font-semibold">第1条（適用）</h2>
          <p>
            本規約は、ClipForge（以下「本サービス」）の利用に関する条件を定めるものです。
            ユーザーは本サービスを利用することにより、本規約に同意したものとみなします。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold">
            第2条（サービス内容）
          </h2>
          <p>
            本サービスは、ユーザーがアップロードした商品写真をもとに、
            AI技術を用いてショート動画を自動生成するサービスです。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold">
            第3条（アカウント登録）
          </h2>
          <ol className="list-inside list-decimal space-y-2">
            <li>
              ユーザーは正確な情報を提供してアカウントを登録するものとします。
            </li>
            <li>
              アカウントの管理はユーザーの責任とし、第三者への譲渡・貸与は禁止します。
            </li>
            <li>
              不正利用が確認された場合、事前通知なくアカウントを停止することがあります。
            </li>
          </ol>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold">
            第4条（料金・支払い）
          </h2>
          <ol className="list-inside list-decimal space-y-2">
            <li>有料プランの料金は料金ページに記載のとおりです。</li>
            <li>
              支払いはStripeを通じたクレジットカード決済で行われます。
            </li>
            <li>
              サブスクリプションは自動更新されます。解約はマイページからいつでも可能です。
            </li>
            <li>
              解約後も現在の請求期間の終了までサービスを利用できます。
            </li>
          </ol>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold">第5条（禁止事項）</h2>
          <p>ユーザーは以下の行為を行ってはなりません。</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>法令または公序良俗に反するコンテンツのアップロード</li>
            <li>他者の知的財産権・肖像権を侵害するコンテンツの使用</li>
            <li>本サービスの運営を妨害する行為</li>
            <li>不正アクセスやリバースエンジニアリング</li>
            <li>自動化ツールによる大量アクセス</li>
            <li>その他、運営者が不適切と判断する行為</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold">
            第6条（知的財産権）
          </h2>
          <ol className="list-inside list-decimal space-y-2">
            <li>
              ユーザーがアップロードした画像の権利はユーザーに帰属します。
            </li>
            <li>
              本サービスで生成された動画の利用権はユーザーに付与されます。
              ただし、本サービスの改善目的で匿名化された統計データを利用する場合があります。
            </li>
            <li>
              本サービスのUI・ロゴ・コードなどの権利は運営者に帰属します。
            </li>
          </ol>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold">
            第7条（免責事項）
          </h2>
          <ol className="list-inside list-decimal space-y-2">
            <li>
              AI生成の性質上、出力結果の品質を保証するものではありません。
            </li>
            <li>
              本サービスの一時的な停止・障害によるユーザーの損害について、
              運営者は責任を負いません。
            </li>
            <li>
              ユーザーが生成した動画の利用により生じた問題について、
              運営者は責任を負いません。
            </li>
          </ol>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold">
            第8条（サービスの変更・終了）
          </h2>
          <p>
            運営者は、事前にユーザーに通知することにより、本サービスの内容を変更、
            または提供を終了することができるものとします。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold">
            第9条（規約の変更）
          </h2>
          <p>
            運営者は必要に応じて本規約を変更できるものとします。
            変更後の規約は本ページに掲載した時点で効力を生じます。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold">
            第10条（準拠法・管轄）
          </h2>
          <p>
            本規約は日本法に準拠し、本サービスに関する紛争は
            東京地方裁判所を第一審の専属的合意管轄裁判所とします。
          </p>
        </section>
      </div>
    </div>
  );
}
