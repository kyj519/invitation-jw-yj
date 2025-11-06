# JW & YJ 모바일 청첩장

모바일에서 보기 좋은 싱글 페이지 청첩장 뼈대입니다. 이름, 날짜, 사진, 지도 링크 등을 원하는 내용으로 교체해 깃허브 페이지(GitHub Pages)로 간편하게 배포할 수 있습니다.

## 구성
- `index.html`: 초대장 메인 페이지. 섹션(히어로, 연애 이야기, 예식 안내, 사진첩, 오시는 길, 참석 폼) 뼈대와 Adobe Fonts 키 연동 링크가 포함되어 있습니다.
- `styles.css`: 모바일 퍼스트 기반의 커스텀 스타일. 색상, 타이포그래피(Adobe Fonts 변수), 그림자 등을 CSS 변수로 관리합니다.
- `script.js`: 디데이(D-day) 카운트다운과 부드러운 스크롤 기능을 담당합니다.

## 커스터마이즈 가이드
1. **이름 · 날짜 · 장소**  
   `index.html`의 히어로 섹션에서 텍스트를 직접 수정하세요. 디데이 날짜는 `data-countdown-date="YYYY-MM-DDTHH:mm:ss"` 속성을 원하는 일정으로 변경하면 됩니다.
2. **연애 이야기 & 예식 안내**  
   `section` 블록 안의 카드 텍스트를 원하는 내용으로 채워넣으세요. 필요 없는 카드는 삭제해도 됩니다.
3. **캘린더 초대**  
   예식 일정은 `wedding-invite.ics` 파일로 제공됩니다. 시간·장소가 달라지면 `.ics` 파일을 수정하고, `index.html`의 구글 캘린더 링크(날짜·장소·설명 파라미터)도 함께 갱신하세요. 단일 버튼이 기기를 감지해 Apple 기기에서는 `.ics` 파일을, Android/그 외에는 구글 캘린더 링크를 자동으로 엽니다.
4. **사진첩**  
   `section#gallery` 안의 각 `gallery-tile` 요소에 `style="--gallery-image:url('이미지경로')"`를 추가하면 사진이 배경으로 채워집니다. 타일 유형(`--hero`, `--tall`, `--wide`)을 조정해 레이아웃을 맞춰보세요.
5. **오시는 길**  
   `script.js`의 `KAKAO_MAP_APP_KEY`에 카카오 개발자 콘솔에서 발급받은 JavaScript 키를 입력하면 지도 위에 위치가 자동으로 표시됩니다. (허용 도메인을 등록해야 정상 출력됩니다.) 키를 쓰지 않고 정적 이미지를 사용하려면 `index.html`의 `#kakao-map` 요소에 `data-image="이미지경로"`를 지정하면 됩니다.
6. **참석 폼**  
   기본 폼은 동작하지 않습니다. Google Forms, Typeform 등으로 대체하거나 서버와 연동하려면 JavaScript 코드를 추가하세요.
7. **배경 / 테마 색감**  
   `styles.css`의 `:root` 색상 변수와 `.section`·`.story-card` 등의 배경을 조절하면 지금의 짙은 벽지 컨셉을 다른 분위기로 쉽게 바꿀 수 있습니다.

Adobe Fonts를 사용할 때는 `styles.css`의 `--font-body`, `--font-display` 값에 Adobe에서 발급한 실제 글꼴 이름을 적어주면 됩니다(예: `"source-han-sans-korean"`). Adobe Fonts 대시보드에서 웹 프로젝트에 초대장 도메인을 추가하는 것도 잊지 마세요.

## 로컬에서 미리보기
간단한 정적 서버로 확인할 수 있습니다. Python이 설치되어 있다면 아래 중 하나를 실행하세요.

```bash
# Python 3
python3 -m http.server 8000
# Python 2
python -m SimpleHTTPServer 8000
```

브라우저에서 `http://localhost:8000` 접속 후 디자인과 레이아웃을 점검하세요.

## GitHub Pages 배포
1. 이 저장소를 깃허브에 올립니다.
2. GitHub에서 `Settings` → `Pages`로 이동합니다.
3. `Source`에서 `Deploy from a branch`를 선택하고 `main` 브랜치의 `/ (root)`를 지정합니다.
4. 저장하면 몇 분 내에 `https://<GitHub-계정>.github.io/<저장소명>/` URL로 접속할 수 있습니다.

필요하면 `CNAME` 파일을 추가해 커스텀 도메인도 연결할 수 있습니다.
