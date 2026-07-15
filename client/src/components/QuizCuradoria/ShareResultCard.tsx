import { SITE_LOGO_PATH } from "@shared/const/site";
import { appPath } from "@/lib/appUrl";
import { forwardRef } from "react";

interface ShareResultCardProps {
  profileName: string;
  productName: string;
  productImage: string;
}

/**
 * Fonte de dados offscreen para o Canvas de compartilhamento.
 * O visual final é desenhado em shareQuizResult.ts (1080×1080).
 */
const ShareResultCard = forwardRef<HTMLDivElement, ShareResultCardProps>(
  function ShareResultCard({ profileName, productName, productImage }, ref) {
    return (
      <div
        ref={ref}
        aria-hidden
        data-share-quiz-url={appPath("/quiz")}
        style={{
          position: "fixed",
          left: "-10000px",
          top: 0,
          width: 1,
          height: 1,
          overflow: "hidden",
          opacity: 0,
          pointerEvents: "none",
        }}
      >
        <img data-share-logo src={SITE_LOGO_PATH} alt="" crossOrigin="anonymous" />
        <span data-share-profile>{profileName}</span>
        <img
          data-share-product-image
          src={productImage}
          alt=""
          crossOrigin="anonymous"
        />
        <span data-share-product-name>{productName}</span>
      </div>
    );
  },
);

export default ShareResultCard;
