# 청년친구 디자인 브리프

## 1. 브랜드 방향성
- **키워드**: 친근한 공공 비서, 신뢰감, 청년 맞춤.
- **사용자**: 주거·커리어·지역 혜택을 찾는 20~30대 청년.
- **목표**: 데이터 포털의 공신력 + 모바일 비서의 편안함을 결합한 톤 앤 매너.

## 2. 컬러 시스템
| 용도 | 색상 | Hex |
| --- | --- | --- |
| Primary | 코발트 블루 | `#0B4DFF` |
| Secondary | 민트 | `#00B8A9` |
| Accent | 마감/알림 오렌지 | `#FF8A34` |
| Background | 밝은 파스텔 | `#F4F6FB` |
| Surface | 카드 배경 | `#FFFFFF` |
| Border | 카드 보더 | `#E2E5ED` |

- Primary/Secondary는 히어로 카드, CTA, 주요 아이콘에 사용.
- Accent 색상은 D-Day 배지, 오류/알림 컴포넌트에만 사용해 시선 집중.

## 3. 타이포그래피
- **Korean**: Pretendard (Bold/Medium/Regular)
- **English fallback**: Inter 또는 Roboto
- Title: Pretendard Bold 28pt (모바일), Subtitle 18pt Medium, Body 16pt Regular, Caption 12-13pt.

## 4. 컴포넌트 스타일
- 카드: 라운드 16px, 그림자 대신 1px 보더(#E2E5ED) + 미세한 음영.
- 버튼: Primary 버튼은 꽉 찬 컬러 + 14px 라운드, Secondary는 보더형 혹은 링크 텍스트.
- 배지: Rounded Pill, 대문자 텍스트, 마감 배지는 `#FF8A34`.
- 아이콘: 단색 라인 아이콘 권장(Feather/Tabler 스타일), 배경 그라디언트를 가볍게 적용 가능.

## 5. 핵심 화면 가이드
### 5.1 온보딩 (3단계)
1. 관심 분야 선택 카드(주거/커리어/교육/지역생활/창업).
2. 거주/희망지역 선택.
3. 당장 필요한 목표 선택.
- 각 단계마다 상단 진행 바, CTA 버튼(Primary) + “나중에 할게요” 텍스트.

### 5.2 홈 대시보드
- **Hero 카드**: “맞춤 혜택 비서” 카피, 미묘한 일러스트/아이콘.
- **추천 혜택 목록**: 태그, D-Day, 요약, CTA(자세히 보기).
- **Quick Actions**: 온보딩 재시작, 즐겨찾기, 신청 체크리스트 등 3~4개 버튼.
- **페르소나 하이라이트**: 온보딩 결과를 요약해 사용자 스스로 컨텍스트를 이해하도록 지원.

### 5.3 Explore / 데이터 뷰
- 주요 Open API 소스 카드: 제목, 설명, 동기화 주기.
- 4주 로드맵 타임라인: 주차 배지 + 설명 라벨.
- 향후 추가될 알림/신청 프로세스의 Placeholder 섹션.

## 6. 인터랙션/모션
- 온보딩 카드 스와이프, 버튼 누름에 150ms scale 애니메이션.
- D-Day 배지는 페이드/슬라이드로 등장하여 마감 임박 알림 강조.

## 7. 산출물 요구사항
- Figma 파일에 Color/Type Token 정의, Component set(MenuCard, BenefitCard 등) 구성.
- 화면 최소 3종(온보딩, 홈, Explore) + 스타일 가이드 페이지.
- Export용 PNG/PDF를 준비해 CLI에서도 확인할 수 있도록 대비.
