# Creative Search v1 → v2 데이터/화면 매핑 가이드

목표
- 기존 프로토타입(`creative-search.jsx`, `creative-search-key-message.jsx`)의 로컬 상수/로직을 유지하면서,
  v2 데이터셋(`window.__APP.dataset.creativeSearchV2`)으로 **치환 가능한 매핑 규칙**을 제공합니다.
- “클러스터” → “소재 유형(그룹)” 용어 전환과 모달 업데이트(설명 + 썸네일 그리드)를 함께 고려합니다.

## 공통: 데이터 접근 경로

- v2 데이터셋은 `boot.js`에서 로드되며 전역으로 접근합니다.

```js
const ds = window.__APP.dataset.creativeSearchV2;
// ds.promos, ds.brands, ds.products, ds.creativeAssets, ds.creativeTypeGroups, ds.abTestSuggestions ...
```

## 1) `creative-search.jsx` 매핑

### 1-1. 기본 상수/필드 매핑

| v1(현재) | v2(권장) | 비고 |
|---|---|---|
| `PROMO.key/start/end` | `ds.promos[].key/start/end` | 스코프 키는 `promoId` |
| `BRANDS[]` | `ds.brands[]` | `isOwn`/`thumbUrl` 포함 |
| `MOCK_CREATIVES[]` | `ds.creativeAssets[]` | 생성형(풍부한 수량) |
| `creative.layout` | `asset.layoutKey` | v1 layoutKey와 호환 |
| `creative.thumbUrl` | `asset.thumbnailUrl` | v2는 data-url SVG (타입 차이 보임) |
| `creative.keyMessage` | `asset.derivedSignals` + `asset.evidence` | v2는 근거 구조를 분리 |
| `cluster` | `creativeTypeGroup` | 용어/스키마 변경 |

### 1-2. 결과 풀 구성(프로모션 기준)

- v1: `promoPool = MOCK_CREATIVES.filter(inRange(...))`
- v2: `promoPool = ds.creativeAssets.filter(x => x.promoId === currentPromoId)`

권장: “표시 검색어(queryLabel)”은 그대로 두고, 내부 쿼리/필터는 promoId 기반으로 유지합니다.

### 1-3. 브랜드별 요약(brandSummaries) 유지/치환

v1에서 계산하던 항목들은 v2에서도 동일하게 계산 가능합니다.

- 미디어 비중
  - v1: `mediaType === "image"|"video"`
  - v2: 동일
- 광고유형 비중
  - v1: `adType === "normal"|"partnership"`
  - v2: 동일
- 반복 특징(레이아웃/CTA/카피/텍스트 버킷)
  - v1: `layout`, `ctaType`, `copyType`, `textRatio`
  - v2: `layoutKey`, `ctaType`, `copyType`, `textRatio`

### 1-4. “클러스터(유형)” 노출/모달 매핑

#### v1 동작(현재)
- `MOCK_CLUSTERS_BY_BRAND` → 브랜드 요약 카드 우측에 리스트
- 클릭 → Drawer로 “클러스터 특징 + 클러스터 내 소재 리스트” 노출

#### v2 권장
- 데이터: `ds.creativeTypeGroups`에서 `brandId`로 필터링
- UI 용어: “클러스터” 금지, “소재 유형” 사용
- 모달(필수 요구사항):
  - 좌: `group.description` + “근거 보기”(group.rationale)
  - 우: `group.heroThumbnailUrls[]` 썸네일 그리드(6~12)
  - 다음 액션(선택): 해당 그룹의 `assetIds`로 라이브러리 필터 적용

### 1-5. A/B 제안 매핑(근거 + 실제 타입 예시)

#### v1(현재)
- `abSuggestionForCluster(cluster)`가 휴리스틱으로 A/B 정보를 생성
- UI는 실루엣 이미지(레이아웃) 중심

#### v2(권장)
- `ds.abTestSuggestions[]`를 그대로 렌더링
  - `suggestion.evidence`를 “근거 보기” 영역에 출력(하드코딩 문장 X)
  - `suggestion.groups[].creativePlan[].assetExamples[]`를 썸네일 그리드로 노출
  - 그룹당 “타입 2개”, 타입당 “애셋 2~3개”가 기본 목표

## 2) `creative-search-key-message.jsx` 매핑

### 2-1. v1 모델(현재)
- 결과 아이템: `{ focus: ingredient|composition, token, layoutClass, mediaType, predictedScore, thumbUrl ... }`
- 목적: 성분 강조 vs 제품 구성 강조 비교

### 2-2. v2 모델(권장)

#### 성분별 특징(요구사항 #1)
- 데이터: `ds.ingredientInsights[]`
- 성분 선택 UI(칩/드롭다운) → 선택 성분에 대한 아래 섹션을 렌더링
  - `summary`
  - `commonLayouts/commonCopyTypes/commonCTAs`
  - `visualTraits`, `doDonts`
  - `exampleAssetIds` → `ds.creativeAssets`에서 찾아 썸네일 그리드 구성

#### 기존 “성분 vs 구성” 비교의 유지 옵션
- v2 데이터셋은 “제품 구성 강조(composition)”을 별도 엔티티로 만들지 않고,
  `CreativeAsset.derivedSignals/typeKey` 조합으로 “정보형/혜택형” 등을 표현합니다.
- 따라서 key-message 페이지를 v2로 완전 치환하려면 두 가지 선택지가 있습니다.
  - 옵션 A(권장): key-message 페이지는 “성분별 인사이트”에 집중(요구사항 #1 충족)
  - 옵션 B: composition 토큰/인사이트 엔티티를 추가(추가 설계 필요)

## 3) 공통 텍스트/용어 매핑

| v1 텍스트 | v2 텍스트(권장) |
|---|---|
| 클러스터 | 소재 유형 |
| 클러스터 보기 | 유형 보기 |
| 클러스터 내 소재 | 유형에 속한 소재 |

## 4) 적용 순서(권장 마이그레이션 단계)

1. v2 데이터셋 모듈 로드(boot.js에 추가)  
2. `creative-search.jsx`: 결과 풀을 `ds.creativeAssets`로 전환(요약/차트 로직 유지)  
3. “소재 유형 모달”을 공통 컴포넌트로 만들고, v1 클러스터 UI를 대체  
4. A/B 영역을 `ds.abTestSuggestions` 기반으로 전환(근거/애셋 예시 포함)  
5. `creative-search-key-message.jsx`: “성분별 인사이트” 섹션/탭 추가 후 `ds.ingredientInsights` 연결  
6. 비교 대시보드: `ds.competitiveCompareSlices`를 연결해 한 화면 비교 제공

