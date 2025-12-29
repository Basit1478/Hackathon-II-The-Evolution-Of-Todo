---
description: "Task list for Phase I Todo CLI Application implementation"
---

# Tasks: Phase I Todo CLI Application

**Input**: Design documents from `/specs/1-todo-cli-app/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project structure per implementation plan at `todo_app.py`
- [X] T002 Initialize Python project with proper imports for built-in modules only
- [X] T003 [P] Create tests directory structure at `tests/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Tests for Foundational Phase (OPTIONAL) ⚠️

- [X] T004 [P] [US0] Unit test for Task class initialization in `tests/test_todo_app.py`
- [X] T005 [P] [US0] Unit test for TaskManager initialization in `tests/test_todo_app.py`

### Implementation for Foundational Phase

- [X] T006 Create Task class with ID, description, and status fields as per spec.md:138-141 and plan.md:72,120
- [X] T007 Create TaskManager class with in-memory storage as per plan.md:73,81-82,121
- [X] T008 Implement sequential ID generation strategy as per plan.md:91-94
- [X] T009 Create TodoCLI class structure for menu interface as per plan.md:74,105,122
- [X] T010 Implement basic main function to orchestrate application as per plan.md:75,107,123

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Add Task (Priority: P1) 🎯 MVP

**Goal**: User can add new tasks to their todo list via a console interface with unique IDs and "incomplete" status by default

**Independent Test**: User can successfully add a new task with a description and see it appear in the task list (spec.md:46)

**Acceptance Scenarios**: As per spec.md:48-50
1. Given user is at main menu, When user selects "Add Task" with valid description, Then task added with unique ID and "incomplete" status
2. Given user is at main menu, When user selects "Add Task" with empty description, Then error message shown and prompt for valid description

### Tests for User Story 1 (OPTIONAL) ⚠️

- [X] T011 [P] [US1] Unit test for add_task method in `tests/test_todo_app.py`
- [X] T012 [P] [US1] Unit test for empty description validation in `tests/test_todo_app.py`
- [X] T013 [P] [US1] Unit test for unique ID assignment in `tests/test_todo_app.py`

### Implementation for User Story 1

- [X] T014 [P] [US1] Implement add_task method in TaskManager class as per plan.md:127
- [X] T015 [US1] Implement add task functionality in CLI interface as per spec.md:FR-003
- [X] T016 [US1] Add validation for non-empty task descriptions as per spec.md:FR-003 and data-model.md:20
- [X] T017 [US1] Ensure new tasks get "incomplete" status by default as per spec.md:141 and data-model.md:15
- [X] T018 [US1] Add task to in-memory list with unique ID as per plan.md:91-94

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - View Task List (Priority: P1)

**Goal**: User can see all tasks in their todo list with completion status and unique IDs

**Independent Test**: User can view a list of all tasks with their IDs, descriptions, and completion status displayed in a readable format (spec.md:60)

**Acceptance Scenarios**: As per spec.md:62-64
1. Given user has tasks in system, When user selects "View Task List", Then all tasks displayed with ID, description, and status
2. Given user has no tasks in system, When user selects "View Task List", Then message indicating list is empty

### Tests for User Story 2 (OPTIONAL) ⚠️

- [X] T019 [P] [US2] Unit test for get_all_tasks method in `tests/test_todo_app.py`
- [X] T020 [P] [US2] Unit test for empty list handling in `tests/test_todo_app.py`

### Implementation for User Story 2

- [X] T021 [P] [US2] Implement get_all_tasks method in TaskManager as per plan.md:128
- [X] T022 [US2] Implement view task list functionality in CLI interface as per spec.md:FR-004
- [X] T023 [US2] Format task display with ID, description, and status as per spec.md:56 and data-model.md:11-15
- [X] T024 [US2] Handle empty task list scenario with appropriate message as per spec.md:FR-009

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Mark Task Complete / Incomplete (Priority: P2)

**Goal**: User can update the completion status of tasks to track their progress

**Independent Test**: User can change the status of any existing task from complete to incomplete or vice versa (spec.md:74)

**Acceptance Scenarios**: As per spec.md:77-79
1. Given user has tasks, When user selects "Mark Task Complete" with valid task ID, Then task status changes to "complete"
2. Given user has completed tasks, When user selects "Mark Task Incomplete" with valid task ID, Then task status changes to "incomplete"
3. Given user attempts to mark task with invalid ID, When user enters ID, Then error message shown indicating task does not exist

### Tests for User Story 3 (OPTIONAL) ⚠️

- [X] T025 [P] [US3] Unit test for mark_task_complete method in `tests/test_todo_app.py`
- [X] T026 [P] [US3] Unit test for mark_task_incomplete method in `tests/test_todo_app.py`
- [X] T027 [P] [US3] Unit test for invalid task ID validation in `tests/test_todo_app.py`

### Implementation for User Story 3

- [X] T028 [P] [US3] Implement mark_task_complete method in TaskManager as per plan.md:132
- [X] T029 [P] [US3] Implement mark_task_incomplete method in TaskManager as per plan.md:133
- [X] T030 [US3] Implement get_task_by_id method in TaskManager as per plan.md:129
- [X] T031 [US3] Implement mark complete functionality in CLI interface as per spec.md:FR-005
- [X] T032 [US3] Implement mark incomplete functionality in CLI interface as per spec.md:FR-005
- [X] T033 [US3] Add validation for existing task ID before status change as per spec.md:FR-008

**Checkpoint**: At this point, User Stories 1, 2 AND 3 should all work independently

---

## Phase 6: User Story 4 - Update Task (Priority: P3)

**Goal**: User can modify the description of an existing task

**Independent Test**: User can update the description of any existing task while preserving its ID and completion status (spec.md:89)

**Acceptance Scenarios**: As per spec.md:92-93
1. Given user has tasks, When user selects "Update Task" with valid task ID and new description, Then task description updated while maintaining other attributes
2. Given user attempts to update task with invalid ID, When user enters ID, Then error message shown indicating task does not exist

### Tests for User Story 4 (OPTIONAL) ⚠️

- [X] T034 [P] [US4] Unit test for update_task method in `tests/test_todo_app.py`
- [X] T035 [P] [US4] Unit test for preserving task attributes during update in `tests/test_todo_app.py`

### Implementation for User Story 4

- [X] T036 [P] [US4] Implement update_task method in TaskManager as per plan.md:130
- [X] T037 [US4] Implement update task functionality in CLI interface as per spec.md:FR-006
- [X] T038 [US4] Preserve task ID and status during description update as per spec.md:FR-006
- [X] T039 [US4] Add validation for existing task ID before update as per spec.md:FR-008

**Checkpoint**: At this point, User Stories 1, 2, 3 AND 4 should all work independently

---

## Phase 7: User Story 5 - Delete Task (Priority: P3)

**Goal**: User can remove tasks they no longer need

**Independent Test**: User can remove any existing task from the system by providing its ID (spec.md:103)

**Acceptance Scenarios**: As per spec.md:106-107
1. Given user has tasks, When user selects "Delete Task" with valid task ID, Then task removed from in-memory list
2. Given user attempts to delete task with invalid ID, When user enters ID, Then error message shown indicating task does not exist

### Tests for User Story 5 (OPTIONAL) ⚠️

- [X] T040 [P] [US5] Unit test for delete_task method in `tests/test_todo_app.py`
- [X] T041 [P] [US5] Unit test for task removal validation in `tests/test_todo_app.py`

### Implementation for User Story 5

- [X] T042 [P] [US5] Implement delete_task method in TaskManager as per plan.md:131
- [X] T043 [US5] Implement delete task functionality in CLI interface as per spec.md:FR-007
- [X] T044 [US5] Remove task from in-memory list by ID as per spec.md:FR-007
- [X] T045 [US5] Add validation for existing task ID before deletion as per spec.md:FR-008

**Checkpoint**: All user stories should now be independently functional

---

## Phase 8: CLI Menu and Application Flow

**Goal**: Implement the menu-based console interface and application control flow

**Based on**: plan.md:98-101, spec.md:FR-001

### Tests for Menu and Flow (OPTIONAL) ⚠️

- [X] T046 [P] [MEN] Unit test for menu loop functionality in `tests/test_todo_app.py`
- [X] T047 [P] [MEN] Unit test for application exit flow in `tests/test_todo_app.py`

### Implementation for Menu and Flow

- [X] T048 [P] [MEN] Implement main menu loop with options 1-7 as per quickstart.md:27-36
- [X] T049 [MEN] Implement menu routing to appropriate methods as per plan.md:100
- [X] T050 [MEN] Implement application startup flow as per plan.md:123
- [X] T051 [MEN] Implement application exit functionality
- [X] T052 [MEN] Ensure menu loop continues until user chooses to exit as per plan.md:98

---

## Phase 9: Input Validation and Error Handling

**Goal**: Implement comprehensive input validation and error handling as per plan.md:111-114

### Tests for Validation and Error Handling (OPTIONAL) ⚠️

- [X] T053 [P] [ERR] Unit test for invalid menu selection handling in `tests/test_todo_app.py`
- [X] T054 [P] [ERR] Unit test for non-numeric ID validation in `tests/test_todo_app.py`
- [X] T055 [P] [ERR] Unit test for empty input handling in `tests/test_todo_app.py`

### Implementation for Validation and Error Handling

- [X] T056 [P] [ERR] Implement validation for invalid menu selections as per plan.md:111
- [X] T057 [ERR] Implement validation for non-numeric task IDs as per plan.md:111
- [X] T058 [ERR] Implement validation for empty task descriptions as per plan.md:138
- [X] T059 [ERR] Implement error handling for missing tasks as per plan.md:112
- [X] T060 [ERR] Implement error handling for empty task lists as per plan.md:113
- [X] T061 [ERR] Implement graceful degradation after error conditions as per plan.md:114
- [X] T062 [ERR] Provide clear error messages to users as per plan.md:140

**Checkpoint**: Application should handle all error conditions gracefully

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T063 [P] Documentation updates in `todo_app.py` docstrings
- [X] T064 Code cleanup and refactoring
- [X] T065 [P] Additional unit tests as needed in `tests/test_todo_app.py`
- [X] T066 Run quickstart.md validation to ensure functionality matches specification

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Menu Flow (Phase 8)**: Depends on core functionality (Phases 1-7)
- **Error Handling (Phase 9)**: Can be implemented after core functionality
- **Polish (Final Phase)**: Depends on all desired features being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2/US3 but should be independently testable
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2/US3/US4 but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Add Task)
4. Complete Phase 4: User Story 2 (View Task List)
5. **STOP and VALIDATE**: Test core functionality independently
6. Complete Phase 8: Menu and Flow
7. Complete Phase 9: Error Handling
8. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
   - Developer D: User Story 4
   - Developer E: User Story 5
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All tasks must reference specification and plan sections as required
- No new features beyond Phase I scope as per spec.md:27-33