# Creative Search (월간 트렌드: 주차/시즌) 페이지 요구사항/설계 (`src/pages/creative-search-monthly-trend.jsx`)

## 개요

이 문서는 **“월간 트렌드” 기반**의 소재 검색 결과 요약 페이지 요구사항과 구현 설계를 정리합니다. 사용자의 자연어 질문(예: “이번 달 많이 사용된 소재 뭐야?”)을 입력으로 가정하고, **2026년 1월**을 기준으로 **주차(일~토)** 및 **시즌 브래킷(프로모션 기간)** 관점에서 소재를 **클러스터 단위**로 요약/탐색합니다.

## 목표(Why)

- “이번 달”에 실제로 많이 사용된 소재 스타일을 **주차별/시즌별로 구조화**해 보여줍니다.
- 단순 나열이 아니라 “클러스터”를 통해 **반복 패턴(키 메시지/CTA/레이아웃/미디어/밈 사용)**을 빠르게 파악할 수 있게 합니다.
- 최신 트렌드로 가정한 **밈 사용 소재 흐름**을 Chat UI와 연결해 “추천 → 이동/하이라이트” 경험을 제공합니다.

## 범위(Scope)

### 포함

- Top bar: 페이지 제목/설명 + 검색어/총 건수/검색 시간 pill
- “검색결과 인사이트”: 2줄 자연어 요약(월간 전체 특징 + 최신 주차 트렌드)
- “검색 결과 요약”: fold(접기/펼치기)
  - 접힘: 시즌 브래킷(프로모션) + 주차 범위 pill
  - 펼침:
    - 시즌 브래킷 카드(프로모션 기간 내 클러스터 Top3 + 썸네일 스트립)
    - 주차별 카드(W1~Wn): 각 주차의 Top3 클러스터(칩/요약/썸네일 스트립 + “클러스터 보기”)
    - 최신 주차에는 최소 1개 “밈 사용” 클러스터 포함(강조/추천 플로우)
- “검색 결과 카드 리스트”: 상위 N개 카드(기본 36개) + runDays ≥ 7 “고효율 예상” 뱃지
- 모달
  - Creative detail modal: 소재 상세 정보
  - Cluster modal: 클러스터 내부 소재 리스트
- 우측 하단 UI
  - AI Chat(밈 추천 흐름)
  - 최상단 버튼

### 제외(프로토타입 한계)

- 실제 광고 플랫폼/로그 기반 집계 및 실제 이미지/비디오 파일은 포함하지 않습니다.
- 실제 밈 트렌드 분석/추천 모델은 없으며, 사전 정의된 `MEME_LIBRARY`를 사용합니다.

## 핵심 요구사항(Requirements)

- **기간 고정**
  - 월: **2026-01**(로컬 타임존 기준)
  - 주차: **일요일~토요일** 경계로 표시하며, 주차 범위는 month 밖으로 확장될 수 있음(표기용)
  - 시즌 브래킷(프로모션): **1/1~1/4 “신년맞이 프로모션”** 고정
- **데이터 규모**
  - 최소 **200+** 소재(현재 기본 260 target)
  - 이미지:영상 비중 **약 4:6**
- **클러스터 구조**
  - 주차별 **3~5개** 클러스터
  - 클러스터당 **5~30개** 소재(자연스러운 분포)
  - **최신 주차에는 “밈 사용” 클러스터 최소 1개** 포함
- **요약/탐색 UX**
  - 요약은 접힘/펼침으로 정보 밀도를 조절
  - “밈 추천”을 받으면 최신 주차의 밈 클러스터 위치로 **자동 이동 + 하이라이트**

## UI/정보 구조(IA)

- Top bar
  - 타이틀: “소재 검색 결과 (월간 트렌드)”
  - 설명: 2026년 1월 주차/시즌 브래킷 기반 요약
  - pill: 검색어 / 총 N건 / 검색 시간
- 카드 영역
  - 검색결과 인사이트(2문장)
  - 검색 결과 요약(접힘/펼침)
    - 시즌 브래킷 카드
    - 주차별 카드(W1~)
  - 검색 결과 카드 리스트(상위 36개)
- 오버레이/플로팅
  - 클러스터 모달
  - 소재 상세 모달
  - AI Chat(밈 추천) + 최상단 버튼

## 데이터/로직 설계

### 주차 계산

- `buildWeeksForMonth({ year, monthIndex })`
  - `weekStartSunday()` / `weekEndSaturday()`로 주차 경계 계산
  - month와 주차 범위가 겹치는 기간을 `monthIntersection`으로 유지(집계/표기 분리)

### 월간 데이터 생성(모사 데이터)

- `buildMonthlyDataset({ totalTarget = 260, seed })`
  - `weekTargets`: month 내 일수 비중으로 주차별 목표 개수를 배분 후 rounding 보정
  - `buildWeekClusters()`: 주차별 클러스터 템플릿(키 메시지/CTA/미디어 바이어스/레이아웃 풀/밈 사용 여부)
  - `allocateClusterSizes()`: 클러스터당 5~30 범위로 자연스러운 크기 분배
  - 각 클러스터 크기만큼 소재를 생성하고, `date`를 monthIntersection 범위 내에서 분산

### 핵심 필드

- 소재(`creative`)
  - `date`, `dateYmd`, `weekKey`
  - `clusterId`, `clusterName`
  - `brandId`, `mediaType`(image/video), `layoutClass`
  - `keyMessageType`, `keyMessage`, `ctaType`
  - `focus`(ingredient/composition/other) — 브랜드 분포/차트 확장용
  - `memeUsage`, `memeTag`
  - `runDays`(3~15), `predictedScore`(0.55~0.97)
  - `thumbUrl`: **data URL SVG** (64x64)

### 결정적 난수(재현 가능)

- `hashStringToInt()` + `seededRand01()`로 pseudo-random을 만들되, 시드 문자열로 고정하여 **리로드해도 동일한 결과**가 생성되도록 합니다.

### 밈 추천 → 클러스터 이동

- `ChatPanel`에서 “Yes” 흐름을 선택하면:
  - 요약을 펼치고(`setSummaryCollapsed(false)`)
  - 최신 주차의 밈 클러스터 DOM id(`meme-${weekKey}-${clusterId}`)로 스크롤
  - 일정 시간 `ring` 스타일로 강조 후 해제

## 썸네일(SVG) 설계

- `buildThumbDataUrl({ seedStr, brandName, mediaType, keyMessageType, token })`
  - 브랜드 마크(2글자)
  - 영상이면 `VID` 배지 + 플레이 아이콘
  - 토큰 텍스트 + 키메시지 타입(짧게)
  - 이미지/영상에 따라 블록 레이아웃을 다르게 구성

## 주요 컴포넌트 설계

- `ClusterThumbStrip`: 클러스터 대표 썸네일들(최대 N) 스트립 표시
- `CreativeCard`: 결과 카드(클러스터명/칩/썸네일/고효율 뱃지)
- `ChatPanel`: 밈 추천(Yes/No) 플로우 + 이동 트리거
- `BackToTopButton`: 스크롤 임계치 이후 노출되는 최상단 이동 버튼
- `CreativeSearchMonthlyTrendPage`: 페이지 루트(요약/모달/채팅 상태 관리 포함)

## 문구/표기 정책

- “고효율 예상” 뱃지는 `runDays ≥ 7` 조건으로 표시합니다(현재 프로토타입 규칙).
- 주차 표기는 일~토 전체 범위를 보여주되, 실제 집계는 `monthIntersection` 기준으로 설명 문구를 제공합니다.

## 실행(로컬)

- 정적 서버로 실행합니다. 예:
  - `python3 -m http.server 5173 --bind 127.0.0.1`

## 변경/확장 포인트

- 실제 데이터로 교체 시:
  - `buildMonthlyDataset()`를 API 응답/집계 결과로 대체
  - 클러스터는 실제 클러스터링 결과(embedding/룰 기반)로 치환 가능
- 밈 추천 고도화:
  - `MEME_LIBRARY`를 트렌드 API/내부 리서치 데이터로 대체
  - “추천 → 템플릿 상세 → 자동 스토리보드 생성” 등으로 확장 가능

