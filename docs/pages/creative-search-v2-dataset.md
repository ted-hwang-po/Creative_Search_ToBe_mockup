# Creative Search v2 목업 데이터셋 스펙 (Feedback 반영)

대상 프로토타입: `src/pages/creative-search.jsx`, `src/pages/creative-search-key-message.jsx`  
데이터 모듈: `src/mock/creative-search-dataset-v2.jsx` (no-build 환경에서 `window.__APP.dataset.creativeSearchV2`로 등록)

## 목적

- 피드백 7가지(성분별 인사이트/유형(그룹) 모달/AB 근거/레이블 최소화/실제 타입 예시/용어 변경/자사 vs 경쟁 비교)를 **데이터 레벨에서 구현 가능**하도록 스키마를 정의합니다.
- “나열형 레이블” 대신 **추천 + 근거(접힘/펼침)**를 렌더링하기 위해, UI가 그대로 출력 가능한 `evidence/rationale` 구조를 포함합니다.

## 모듈 계약(Contract)

- 전역 위치: `window.__APP.dataset.creativeSearchV2`
- 최상위 형태:
  - `version`: `"v2"`
  - `generatedAt`: `"YYYY-MM-DD"`
  - `promos[]`, `brands[]`, `products[]`, `ingredients[]`
  - `creativeAssets[]`
  - `ingredientInsights[]`
  - `creativeTypeGroups[]`
  - `abTestSuggestions[]`
  - `competitiveCompareSlices[]`
  - `__builders` (선택): 생성기/헬퍼 노출(프로토타입에서 튜닝 용)

## 엔티티 스키마

### 1) Brand

- **의도**: 자사/경쟁을 구분하고 썸네일 로고를 제공
- 필드
  - `id`: string
  - `name`: string
  - `isOwn`: boolean
  - `thumbUrl`: string (svg path)

### 2) Promo

- **의도**: “동일 프로모션 기준” 비교/AB 스코프를 만들기 위한 키
- 필드
  - `id`: string
  - `key`: string (예: “올영 세일”)
  - `start`: `YYYY-MM-DD`
  - `end`: `YYYY-MM-DD`

### 3) Product

- **의도**: A/B안이 “실루엣”이 아니라 **동일 상품 기준의 여러 타입(애셋)**으로 제안되도록 productId를 부여
- 필드
  - `id`: string
  - `name`: string
  - `category`: string
  - `heroIngredientId`: string (대표 성분; 성분 인사이트/썸네일 생성에 활용)

### 4) Ingredient

- **의도**: 성분별 특징 요약(요구사항 #1)을 안정적으로 생성/표현
- 필드
  - `id`: string
  - `name`: string
  - `synonyms[]`: string[]
  - `category`: string (예: 진정/미백/장벽)
  - `claims[]`: string[] (예: 톤 개선, 장벽 강화)

### 5) CreativeAsset

- **의도**: 카드/리스트/유형 모달 썸네일의 단위. “근거”와 “스코프”까지 포함.
- 필드(핵심)
  - `id`: string
  - `brandId`: string
  - `productId`: string
  - `promoId`: string
  - `title`: string
  - `caption`: string
  - `mediaType`: `"image"|"video"`
  - `adType`: `"normal"|"partnership"`
  - `runDays`: number
  - `startDate`, `endDate`: `YYYY-MM-DD`
  - `predictedScore`: number (0~1)
  - `layoutKey`: string (v1 layout 호환)
  - `ctaType`, `copyType`: string
  - `textRatio`: number (0~1)
  - `thumbnailUrl`: string (data URL SVG)
- 필드(근거/설명 가능)
  - `derivedSignals`: UI가 빠르게 분류/표시할 수 있는 “추출 신호”
    - 예: `hasBeforeAfter`, `hasCoupon`, `hasUGCTextHeavy`, `hasIngredientProof`, `ingredientId`, `typeKey`, `layoutKey`, `promoId`, `productId`
  - `evidence`: 추천/AB 근거를 문장/지표로 노출 가능한 구조
    - `whyThisWorks[]`: string[]
    - `supportingStats`: `{ ctrLiftPct, roasLiftPct, confidence }` (mock)
    - `comparableSetId`: string (동일 스코프 그룹핑 키)

### 6) IngredientInsight

- **의도**: “성분별 소재 특징”을 **정량(분포) + 정성(visual traits/do-donts)**로 제공
- 필드
  - `ingredientId`: string
  - `summary`: string (1문장)
  - `commonLayouts[]`: `{ layoutKey, pct, label }`
  - `commonCopyTypes[]`: `{ copyType, pct }`
  - `commonCTAs[]`: `{ ctaType, pct }`
  - `visualTraits[]`: string[]
  - `doDonts[]`: `{ kind:"do"|"dont", text:string }`
  - `exampleAssetIds[]`: string[] (상위 예시)

### 7) CreativeTypeGroup (유형/그룹)

- **의도**: 기존 “클러스터”를 사용자 친화 용어인 “소재 유형(그룹)”으로 제공 + 모달에 맞는 데이터 제공
- 필드
  - `id`: string
  - `brandId`: string
  - `name`: string (예: “UGC 리뷰형 (소재 유형)”)
  - `chips[]`: string[] (내부적으로만 사용; 기본은 숨기고 근거 펼침에서 노출)
  - `description`: string (자연어 특징)
  - `predictedGroupScore`: number
  - `heroThumbnailUrls[]`: string[] (모달 썸네일 그리드에 바로 사용)
  - `assetIds[]`: string[] (유형에 속한 소재)
  - `rationale`:
    - `drivers[]`: string[]
    - `evidenceRefs[]`: `{ kind, assetId, predictedScore, whyThisWorks[] }`

### 8) ABTestSuggestion

- **의도**: “A/B 제안은 근거를 더 명확히” + “실루엣이 아니라 실제 타입/애셋 예시”로 제공
- 필드
  - `id`: string
  - `scope`: `{ promoId, productId, ownBrandId }`
  - `objective`: string
  - `periodDays`: number
  - `budgetPerDay`: number
  - `placements[]`: string[]
  - `creativesPerGroup`: number
  - `groups[]`:
    - `key`: `"A"|"B"`
    - `conceptName`: string
    - `hypothesis`: string
    - `creativePlan[]`:
      - `typeKey`, `typeLabel`, `keyMessage`
      - `requiredElements[]`
      - `variants[]` (텍스트/CTA 변형 가이드)
      - `assetExamples[]`: `{ id, thumbnailUrl }` (실제 예시처럼 보이는 썸네일)
  - `evidence`:
    - `summary`: string
    - `drivers[]`: `{ label, value, pct?, note? }`
    - `supportingStats`: `{ topTypePct, avgScoreTop10, sampleSize }`
    - `exampleAssetIds[]`: string[]

### 9) CompetitiveCompareSlice

- **의도**: “자사 vs 경쟁 특징을 한눈에 비교” 화면을 만들기 위한 비교 슬라이스
- 필드
  - `id`: string
  - `scope`: `{ promoId }`
  - `ownBrandId`: string
  - `competitorBrandIds[]`: string[]
  - `compareAxes[]`: `{ axisKey, label }`
  - `rowsByAxis[]`:
    - `{ axisKey, label, ownValue, competitorValues[] }`
    - `ownValue`: `{ kind:"pct"|"label", value:number|string, display? }`
    - `competitorValues[]`: `{ brandId, value:{...} }`

## 데이터 볼륨/품질 기준(프로토타입)

- `creativeAssets`: 120개(생성형). UI에서 “자연스럽게 풍부해 보이는 수준” 확보
- `creativeTypeGroups`: 브랜드별 최대 5개(모달에서 썸네일 6~12개가 자연스럽게)
- `ingredientInsights`: 상위 8개 성분(성분별 특징 섹션/탭에서 사용)
- `abTestSuggestions`: 2개 상품 스코프(동일 상품/프로모션 기준)
- `competitiveCompareSlices`: 1개 프로모션 슬라이스

## 사용 예시(전역 접근)

- 데이터 접근:
  - `window.__APP.dataset.creativeSearchV2.creativeAssets`
  - `window.__APP.dataset.creativeSearchV2.creativeTypeGroups`
  - `window.__APP.dataset.creativeSearchV2.abTestSuggestions`

