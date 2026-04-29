---
category: task-ordering
applied: not-yet
---
## url-to-markdown은 plan 순서를 그대로 유지

**상황**: Step 2, Task 의존성 식별 중. `url-input-form`, `url-to-markdown-page`, `export-menu`, `theme-toggle`가 여러 Task에 걸쳐 재사용되지만 plan상 선행 Task가 후행 Task의 UI/상태 기반을 만드는 구조였다.
**판단**: `Task 1 -> 2 -> 3 -> 4 -> 5 -> 6` 순서를 유지했다. 입력 쉘과 상태 컨테이너를 먼저 만들면 이후 Task가 throwaway stub 없이 같은 컴포넌트 위에 적층된다.
**다시 마주칠 가능성**: 중간 — 단일 페이지 feature는 shell-first 순서가 자주 유효하지만, API 선행이 필요한 경우엔 다시 판단이 필요하다.
