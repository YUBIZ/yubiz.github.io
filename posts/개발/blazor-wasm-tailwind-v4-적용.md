---
title: "Blazor WebAssembly 프로젝트에 Tailwind CSS v4.0 적용하기"
date: "2026-09-10"
tags: [.NET, Blazor, "Blazor WebAssembly", "Tailwind CSS", Tailwind, CSS, Gulp]
---

# 개요

Blazor WebAssembly 프로젝트에 Tailwind CSS v4.0을 적용하는 법을 설명합니다.

본 내용은 윈도우를 기준으로 작성되었습니다.\
타 OS에서의 작동을 보장하지 않습니다.

# 환경 구성하기

먼저 `NPM`이 필요합니다.\
`NPM`은 `Node.js` 설치 시 함께 제공됩니다.

프로젝트 디렉터리로 이동 후, 아래의 명령어를 실행합니다.

```
npm install tailwindcss @tailwindcss/cli
```

# 적용하기

`app.css` 파일의 상단에 아래의 내용을 추가합니다.

```css
@import "tailwindcss";
```

Tailwind CSS는 표준 CSS로 변환해야 사용할 수 있습니다.\
아래의 명령어를 실행해 표준 CSS로 변환합니다.

```
npx @tailwindcss/cli -i wwwroot/css/app.css -o wwwroot/css/app.gen.css --minify
```

`index.html`에서 기존의 `app.css`를 `app.gen.css`로 바꿔줍니다.

```xml
<link rel="stylesheet" href="css/app.gen.css" />
```

이제 프로젝트에 Tailwind CSS를 사용할 수 있습니다.

# CSS 격리

Blazor에는 CSS 모듈화를 위한 CSS 격리라는 기능이 있습니다.\
컴포넌트마다 별도의 CSS 파일을 만들어 스타일을 정의하는 기능으로, 중복 문제를 피할 수 있게 해줍니다.

그러나 Tailwind CSS는 CSS 모듈을 사용하지 않기를 권장합니다.

## 기본 스타일 사용하기

격리된 CSS에서 Tailwind CSS를 사용하기 위해서는 각 파일의 상단에 아래의 내용을 추가합니다.

```css
@reference "tailwindcss";
```

격리된 CSS 역시 표준 CSS로 변환이 필요합니다.\
하지만 개별 파일마다 변환은 비효율적이므로, 다른 방법을 사용합니다.

격리된 CSS는 빌드 시 모두 `{AssemblyName}.styles.css` 파일로 합쳐집니다.
해당 파일을 변환하면 되는데, 현재 설정에 맞는 빌드 출력 경로의 `scopedcss/bundle` 폴더 안에 있습니다.

하지만 해당 파일을 수동으로 변환하는 것은 너무나도 수고스럽기에, 후술할 자동화 방법을 사용하도록 하겠습니다.

## 사용자 정의 스타일 사용하기

Tailwind CSS는 사용자가 다양한 커스텀 스타일을 정의할 수 있습니다.

CSS 모듈은 개별적으로 처리되기 때문에, 커스텀 스타일을 알 수 없습니다.\
그렇기에 스타일이 정의되어 있는 전역 스타일 CSS를 참조해야합니다.

각 파일의 상단에 `@import "tailwindcss";` 대신 아래의 내용을 추가합니다.

```css
@reference "../../../../../wwwroot/css/app.css";
```

참조 경로가 이렇게 복잡한 이유는, `{AssemblyName}.styles.css` 파일에 합쳐진 후 변환되기 때문에 기준 경로가 원본 파일이 아니기 때문입니다.

# 빌드 시 자동으로 변환하기

매 빌드마다 수동으로 변환하기엔 번거로우니, 빌드 시 자동으로 변환되도록 프로젝트에 아래의 내용을 추가합니다.

```xml
<Target Name="PostBuild" AfterTargets="PostBuildEvent">
  <Exec Command="npx @tailwindcss/cli -i wwwroot/css/app.css -o wwwroot/css/app.gen.css --minify" />
  <Exec Command="npx @tailwindcss/cli -i obj/$(ConfigurationName)/$(TargetFramework)/scopedcss/bundle/$(ProjectName).styles.css -o obj/$(ConfigurationName)/$(TargetFramework)/scopedcss/bundle/$(ProjectName).styles.css --minify" />
</Target>
```

# 핫 리로드

Blazor에는 핫 리로드 기능이 있습니다.\
다시 시작하지않고도 코드 변경 내용을 적용할 수 있는 기능으로 매우 유용한 기능으로, Tailwind CSS와 함께 사용할 수 있습니다.

Tailwind CSS는 최적화를 위해 사용하지않는 스타일은 포함하지않습니다.\
그렇기에 기존에 사용하지 않던 유틸리티 클래스를 사용한다면 새롭게 CSS를 변환해줘야 합니다.

## 일반 CSS 파일 변환하기

일반 CSS 파일에 변경사항이 발생하면 이전에 사용했던 명령어를 실행하면 됩니다.\
하지만 매번 직접하기에는 번거로우니, `--watch` 옵션을 추가해 자동으로 변경사항이 발생할 때마다 변환되도록 합니다.

```
npx @tailwindcss/cli -i wwwroot/css/app.css -o wwwroot/css/app.gen.css --minify --watch
```

해당 명령어를 실행하면 변경사항을 감시하여 자동으로 변환해줍니다.

## 격리된 CSS 파일 변환하기

격리된 CSS 파일은 변경사항이 발생하면, 표준 CSS로 변환되지 않은 원본이 `{AssemblyName}.styles.css'의 내용을 대체하게 됩니다.\
그렇기에 `{AssemblyName}.styles.css'을 다시 변환해줘야 하는데, 여기서 문제가 있습니다.\
이전에 사용했던 명령어는 MSBuild의 매크로 변수를 사용했기에 별도로 실행하려면 전체 경로를 직접 작성해야합니다.

하지만 개발 설정이 달라질 때마다 수동으로 경로를 수정하는건 말도 안되니 다른 방법을 찾아봤습니다.

먼저 아래의 내용을 프로젝트에 추가합니다.

```xml
<Target Name="Watch">
	<Exec Command="start npx @tailwindcss/cli -i obj/$(ConfigurationName)/$(TargetFramework)/scopedcss/bundle/$(ProjectName).styles.css -o obj/$(ConfigurationName)/$(TargetFramework)/scopedcss/bundle/$(ProjectName).styles.css --minify --watch" />
</Target>
```

이후 아래의 명령어를 실행하면 됩니다.

```
dotnet build -t:Watch -p:SkipBuild=true
```

사소한 문제가 하나 있는데, 변경사항이 새로고침해야만 적용됩니다.

## 일반 CSS와 격리된 CSS 감시 통합

`Watch`의 내용을 아래와 같이 변경하여 일반 CSS와 격리된 CSS의 변경 사항을 동시에 감시할 수 있습니다.

```xml
<Target Name="Watch">
	<Exec Command="wt -d $(ProjectDir) powershell npx @tailwindcss/cli -i wwwroot/css/app.css -o wwwroot/css/app.gen.css --minify --watch; split-pane -d $(ProjectDir) -V powershell npx @tailwindcss/cli -i obj/$(ConfigurationName)/$(TargetFramework)/scopedcss/bundle/$(ProjectName).styles.css -o obj/$(ConfigurationName)/$(TargetFramework)/scopedcss/bundle/$(ProjectName).styles.css --minify --watch" />
</Target>
```

이제 `Watch`를 실행하면 터미널이 나오게 됩니다.\
해당 창을 종료하면, 감시도 중단됩니다.

## 프로젝트가 열리면 감시 실행하기

비주얼 스튜디오를 사용 중이라면, 프로젝트를 열었을 때 감시가 실행되게 할 수 있습니다.

먼저 프로젝트 디렉터리 이동 후, 아래의 명령어를 실행합니다.

```
npm install --save-dev gulp
```

다음으로 프로젝트 디렉터리에 `gulpfile.js`를 추가 후, 아래와 같이 내용을 작성합니다.

```js
const { spawn } = require("child_process");

exports.watch = function (cb) {
  const process = spawn("dotnet", ["build", "-t:Watch", "-p:SkipBuild=true"], {
    detached: true,
    stdio: "ignore",
  });

  process.unref();

  cb();
};
```

작업 러너 탐색기 창을 엽니다.

![작업 러너 탐색기 메뉴 위치 이미지](/images/blazor-tailwind/task-runner-menu.png)

작업 러너 탐색기 창은 `보기 > 다른 창 > 작업 러너 탐색기` 메뉴로 열 수 있습니다.

![작업 러너 탐색기 바인딩 이미지](/images/blazor-tailwind/task-runner-binding.png)

이제 `watch`를 우클릭 해 컨텍스트 메뉴에서 바인딩 해주면 됩니다.

# 마무리

Tailwind CSS v4.0이 나온지 얼마 안됐다보니 관련 자료 찾기가 많이 힘들었습니다.\
특히 Blazor가 생각보다 마이너해서 Tailwind CSS와 함께 사용한 경우가 별로 없어서 더 그랬던 것 같습니다.

언젠가 비주얼 스튜디오나 Blazor 프로젝트 자체에서 지원해줬으면 좋겠네요.

# 참고

- [Tailwind CLI 설치 문서](https://tailwindcss.com/docs/installation/tailwind-cli)
- [Gulp 문서](https://gulpjs.com/docs/en/getting-started/quick-start)
