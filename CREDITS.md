# 동현램™: 출처·이용 안내

동현램은 1986년 Bally Midway의 오락실 게임 「램페이지(Rampage)」와 그 MS-DOS 이식판(1988 · Activision 발매), 게임보이 어드밴스 합본 「페이퍼보이 / 램페이지(Paperboy / Rampage)」(2005 · Destination Software)에서 따온 도시 부수기의 **뼈대**에서 영감을 받은 비상업적 취미 작품이다. 램페이지의 권리는 Midway Games를 인수한 Warner Bros.에 있고, 페이퍼보이는 Atari Games의 작품이다. 동현램은 이들과 관계가 없고 승인도 받지 않았다.

## 원작에서 가져온 것

- 뼈대만 참고했다: 몬스터가 건물에 매달려 창을 치면 구멍이 나고 건물이 무너지는 것, 창 안의 사람과 길의 적을 먹어 체력을 채우는 것, 군인·헬기·전차의 공격, 체력이 다하면 사람으로 돌아가는 것, 도시를 차례로 옮기는 구성.
- 다르게 만들었다: 1인용, 실험실 식구 다섯 몬스터와 저마다 다른 수치, 한국 일곱 곳과 일본 다섯 곳의 이름을 빌린 열두 도시, 원작보다 훨씬 느린 체력 소모와 큰 회복, 먹는 동작 넷, 저장·불러오기, 손가락 조작.
- 원작 게임의 그림·음악·효과음·지도·코드·글은 하나도 쓰지 않았다. 원작 파일과 그 일부는 이 저장소에 없고, 원작 파일에서 그림이나 자료를 꺼내 쓰지도 않았다.
- 구체적인 수치(체력·피해·회복·점수·층수·적의 수)는 모두 동현램이 정한 것이다.

## 동현램이 새로 만든 것

- 게임 엔진(`src/engine.js`: 건물·창·구멍·무너짐, 걷기·오르기·점프·주먹, 적 다섯과 총알, 체력·목숨·도시 진행, 찍은 자리로 가기), 화면(`src/render.js`), 몬스터·사람·적 그림(`src/sprites.js`, 모두 코드로 그린 도트), 조작·메뉴·저장(`src/app.js`), 동현랭 출전 규약과 예제(`src/examples.js`), 문서, 시험.
- 동현랭 실행기(`src/donghyun.js`)는 [동현랭 저장소](https://github.com/Raspberry-Kim/donghyun-lang)의 v1.55를 고치지 않고 썼다. 합성 효과음(`src/sfx.js`)과 게임패드(`src/gamepad.js`)는 동현워·동현크의 것을 따랐고, 편집기·전체 화면·저장 메뉴는 동현크·동현몬·동현심의 방식을 따랐다.
- 몬스터는 모두 동현 시리즈의 식구다: 포동이(동현랭), 슈슈·라이언(동현파), 꼬리콥터(동현콥), 둠가이(동현둠). 얼굴은 포동이 동현크, 슈슈 동현파(좌우만 뒤집음), 라이언·꼬리콥터·둠가이 동현주의 그림을 그대로 쓴다.

## 포동이와 식구들

포동이는 만든 사람의 강아지다. 포동이·슈슈·라이언·꼬리콥터·둠가이의 이름과 모습(도트 그림 포함)에 대한 권리는 MIT 코드 라이선스와 별개로 만든 사람에게 있다. 코드를 가져다 쓸 때 이들의 그림과 이름은 바꿔 쓰기를 권한다.

## 참고한 자료

- Rampage (video game) — Wikipedia: https://en.wikipedia.org/wiki/Rampage_(video_game)
- Rampage (DOS, 1988, Activision) — PixelatedArcade: https://www.pixelatedarcade.com/games/rampage/releases
- Paperboy / Rampage (GBA, 2005) — Metacritic: https://www.metacritic.com/game/paperboy-rampage/details/
- List of Destination Software games — Wikipedia: https://en.wikipedia.org/wiki/List_of_Destination_Software_games

## 글꼴

검은고딕 Black Han Sans · Pretendard · 나눔고딕코딩 — SIL Open Font License 1.1 (`licenses/`).

## 라이선스

동현램 코드·문서: MIT (`LICENSE`). 동현랭 실행기: MIT (`licenses/DONGHYUN-MIT.txt`).
