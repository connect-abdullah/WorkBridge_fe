# WorkBridge API reference

All versioned routes are mounted under **`/api/v1`**. Interactive docs: **`/docs`** (Swagger), **`/redoc`**.

## Response envelope

Most JSON responses use [`app/core/response.py`](app/core/response.py) `APIResponse[T]`:

| Field     | Type    | Description                                      |
| --------- | ------- | ------------------------------------------------ |
| `success` | boolean | `true` on success, `false` when `fail()` is used |
| `message` | string  | Human-readable message                           |
| `data`    | `T`     | Payload (shape depends on endpoint)              |
| `errors`  | any     | Optional error detail when `success` is false    |

Helper functions `ok(data=..., message=...)` and `fail(message=..., errors=...)` build this shape.

## Routes outside `/api/v1`

| Method | Path                | Description                                     |
| ------ | ------------------- | ----------------------------------------------- |
| `GET`  | `/`                 | App name, version, status                       |
| `GET`  | `/health`           | Liveness check                                  |
| `GET`  | `/invalidate-cache` | Clears app cache (see [`app/cache`](app/cache)) |

---

## Users — `/api/v1/users`

| Method   | Path           | Description                                                                                                                                                                                                 |
| -------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST`   | `/signup`      | Register a user. **Body:** `UserCreate`. **Response `data`:** OpenAPI says `UserRead`; service actually returns `UserLoginResponse` (token + user)—align client with runtime or fix route `response_model`. |
| `POST`   | `/login`       | Login. **Body:** `UserLogin`. **Response `data`:** `UserLoginResponse`.                                                                                                                                     |
| `GET`    | `/{user_id}`   | Get user by id. **Response `data`:** `UserRead`.                                                                                                                                                            |
| `GET`    | `/me`          | Current user (JWT). **Response `data`:** `UserRead`.                                                                                                                                                        |
| `PUT`    | `/update-user` | Update current user. **Body:** `UserUpdate`. **Response `data`:** `UserRead`.                                                                                                                               |
| `DELETE` | `/delete-user` | Delete current user. **Response `data`:** `bool` or omitted.                                                                                                                                                |

**Auth:** `/me`, `/update-user`, `/delete-user` use `get_current_user_id` (Bearer JWT).

### User schemas (`app/entities/user/schema.py`)

**`UserBase`** — `name: str`, `email: EmailStr`, `role: Role`, `avatar: str | None`

**`UserCreate`** — extends `UserBase`, `password: str` (min 8)

**`UserRead`** — extends `UserBase`, `id: int`

**`UserUpdate`** — optional `name`, `email`, `avatar`, `password` (min 8 when set)

**`UserLogin`** — `email`, `password` (min 8)

**`UserLoginResponse`** — `access_token: str`, `token_type: str` (default `"bearer"`), `user: UserRead`

**`Role`** (enum, `app/entities/user/model.py`): `freelancer`, `client`

---

## Projects — `/api/v1/projects`

| Method   | Path                            | Description                                                                                                                                      |
| -------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `POST`   | `/create-project`               | Create project (optional nested milestones). **Body:** `ProjectCreate`. **Response `data`:** `ProjectRead`.                                      |
| `GET`    | `/all`                          | Projects where user is freelancer **or** client, with milestones. **Query:** `user_id: int`. **Response `data`:** `ProjectReadWithMilestones[]`. |
| `GET`    | `/with-milestones/{project_id}` | One project with milestones/tasks/payments. **Response `data`:** `ProjectReadWithMilestones`.                                                    |
| `GET`    | `/{project_id}`                 | Project without milestone tree. **Response `data`:** `ProjectRead`.                                                                              |
| `PUT`    | `/update-project`               | Update project. **Body:** `ProjectUpdate`. **Query:** `project_id`. **Response `data`:** `ProjectRead`.                                          |
| `DELETE` | `/delete-project`               | Delete project (cascade). **Query:** `project_id`. **Response `data`:** `bool`.                                                                  |

### Project schemas (`app/entities/project/schema.py`)

**`ProjectBase`** — `title`, `description`, `status` (`ProjectStatus`, default `PENDING`), `freelancer_id`, `client_id`, `total_amount`, `amount_paid`, `start_date`, `end_date` (datetimes)

**`ProjectCreate`** — `ProjectBase` + optional `milestones: MilestoneCreate[] | None`

**`ProjectRead`** — `ProjectBase` + `id`

**`ProjectReadWithMilestones`** — `ProjectRead` fields + optional `milestones: MilestoneRead[] | None`

**`ProjectUpdate`** — all fields optional + optional `milestones: MilestoneUpdate[] | None`

**`ProjectStatus`**: `pending`, `in_progress`, `completed`, `cancelled`, `paid`

---

## Milestones — `/api/v1/milestones`

| Method   | Path              | Description                                                            |
| -------- | ----------------- | ---------------------------------------------------------------------- |
| `POST`   | `/`               | **Body:** `MilestoneCreate`. **Response `data`:** `MilestoneRead`.     |
| `GET`    | `/{milestone_id}` | Get milestone (tasks + payment). **Response `data`:** `MilestoneRead`. |
| `PUT`    | `/{milestone_id}` | **Body:** `MilestoneUpdate`. **Response `data`:** `MilestoneRead`.     |
| `DELETE` | `/{milestone_id}` | **Response `data`:** `bool`.                                           |

### Milestone schemas (`app/entities/milestone/schema.py`)

**`MilestoneBase`** — `title`, `description`, `status` (`MilestoneStatus | None`), `price`, `due_date` (datetime), `project_id`

**`MilestoneCreate`** — `MilestoneBase` + optional `tasks: TaskCreate[]`, optional `payment: PaymentCreate | None`

**`MilestoneRead`** — `MilestoneBase` + `id`, `approved` (`MilestoneApproval`), optional `tasks: TaskRead[]`, optional `payment: PaymentRead | None`

**`MilestoneUpdate`** — optional fields including `id`, `tasks: TaskUpdate[] | None`, `payment: PaymentUpdate | None`

**`MilestoneStatus`**: `pending`, `in_progress`, `completed`, `cancelled`, `paid`

**`MilestoneApproval`**: `pending`, `approved`, `rejected`, `revision_requested`

---

## Tasks — `/api/v1/tasks`

| Method   | Path         | Description                                              |
| -------- | ------------ | -------------------------------------------------------- |
| `POST`   | `/`          | **Body:** `TaskCreate`. **Response `data`:** `TaskRead`. |
| `PUT`    | `/{task_id}` | **Body:** `TaskUpdate`. **Response `data`:** `TaskRead`. |
| `DELETE` | `/{task_id}` | **Response `data`:** `bool`.                             |

### Task schemas (`app/entities/task/schema.py`)

**`TaskBase`** — `title`, `description`, `milestone_id`

**`TaskCreate`** — same as base

**`TaskRead`** — `TaskBase` + `id`

**`TaskUpdate`** — optional `id`, `title`, `description`

---

## Comments — `/api/v1/comments`

| Method   | Path              | Description                                                                                       |
| -------- | ----------------- | ------------------------------------------------------------------------------------------------- |
| `POST`   | `/create-comment` | **Body:** `CommentCreate`. **Response `data`:** `CommentRead`.                                    |
| `PUT`    | `/update-comment` | **Body:** `CommentUpdate`. **Query:** `comment_id`. **Response `data`:** `CommentRead`.           |
| `DELETE` | `/delete-comment` | **Query:** `comment_id`. **Response `data`:** `bool`.                                             |
| `GET`    | `/`               | **Query:** `project_id`, `user_id` (handler requires both). **Response `data`:** `CommentRead[]`. |

### Comment schemas (`app/entities/comment/schema.py`)

**`CommentBase`** — `comment`, `user_id`, `project_id`

**`CommentCreate`** — `CommentBase`

**`CommentRead`** — `CommentBase` + `id`

**`CommentUpdate`** — optional `comment`

---

## Activity logs — `/api/v1/activity-logs`

| Method | Path                 | Description                                                                                                     |
| ------ | -------------------- | --------------------------------------------------------------------------------------------------------------- |
| `POST` | `/`                  | **Body:** `ActivityLogCreate`. **Response `data`:** `ActivityLogRead`.                                          |
| `GET`  | `/{project_id}`      | Listed first: interpreted as **project** id → list logs. **Response `data`:** `ActivityLogRead[]`.              |
| `GET`  | `/{activity_log_id}` | Same path pattern as above—only the **first** matching `GET` route is used in practice; see routing note below. |

### Activity log schemas (`app/entities/activity_log/schema.py`)

**`ActivityLogBase`** — `activity`, `user_id`, `project_id`, `timestamp` (datetime)

**`ActivityLogCreate`** — `ActivityLogBase`

**`ActivityLogRead`** — `ActivityLogBase` + `id`

**`ActivityLogUpdate`** — optional `activity`, `user_id`, `project_id`, `timestamp`

---

## Meetings — `/api/v1/meetings`

| Method   | Path            | Description                                                                          |
| -------- | --------------- | ------------------------------------------------------------------------------------ |
| `POST`   | `/`             | **Body:** `MeetingCreate`. **Response `data`:** `MeetingRead`.                       |
| `GET`    | `/{project_id}` | First `GET`: list meetings for **project**. **Response `data`:** `MeetingRead[]`.    |
| `GET`    | `/{meeting_id}` | Same path pattern—second route may be unreachable; use distinct paths in production. |
| `PUT`    | `/{meeting_id}` | **Body:** `MeetingUpdate`. **Response `data`:** `MeetingRead`.                       |
| `DELETE` | `/{meeting_id}` | **Response `data`:** `bool`.                                                         |

### Meeting schemas (`app/entities/meetings/schema.py`)

**`MeetingBase`** — `title`, `description`, `meeting_link`, `start_time`, `end_time`, `project_id`, `user_id`

**`MeetingCreate`** — `MeetingBase`

**`MeetingRead`** — `MeetingBase` + `id`

**`MeetingUpdate`** — optional `title`, `description`, `meeting_link`, `start_time`, `end_time`

---

## Files — `/api/v1/files`

| Method | Path            | Description                                                                                                 |
| ------ | --------------- | ----------------------------------------------------------------------------------------------------------- |
| `POST` | `/`             | **Body:** `FileCreate`. **Response `data`:** `FileRead`.                                                    |
| `GET`  | `/{project_id}` | First route: files by **project**. **Response `data`:** `FileRead[]`.                                       |
| `GET`  | `/{file_id}`    | Same pattern as above—routing ambiguity; prefer distinct paths (e.g. `/by-project/{id}` / `/by-file/{id}`). |
| `PUT`  | `/{file_id}`    | **Body:** `FileUpdate`. **Response `data`:** `FileRead`.                                                    |

### File schemas (`app/entities/file/schema.py`)

**`FileBase`** — `file_name`, `file_type` (`FileType`), `file_path`, `uploaded_by`, `uploaded_user` (`UserType`), `project_id`

**`FileCreate`** — `FileBase`

**`FileRead`** — `FileBase` + `id`

**`FileUpdate`** — optional `file_name`, `file_type`

**`FileType`**: `document`, `image`, `video`, `audio`, `other`

**`UserType`** (file uploader): `freelancer`, `client`

---

## Payments — `/api/v1/payments`

| Method   | Path                        | Description                                                                       |
| -------- | --------------------------- | --------------------------------------------------------------------------------- |
| `POST`   | `/`                         | **Body:** `PaymentCreate`. **Response `data`:** `PaymentRead`.                    |
| `GET`    | `/{payment_id}`             | Payment by id. **Response `data`:** `PaymentRead`.                                |
| `GET`    | `/project/{project_id}`     | Payments for project. **Response `data`:** `PaymentRead[]`.                       |
| `GET`    | `/milestone/{milestone_id}` | Payment for milestone (unique per milestone). **Response `data`:** `PaymentRead`. |
| `PUT`    | `/{payment_id}`             | **Body:** `PaymentUpdate`. **Response `data`:** `PaymentRead`.                    |
| `DELETE` | `/{payment_id}`             | **Response `data`:** `bool`.                                                      |

### Payment schemas (`app/entities/payment/schema.py`)

**`PaymentBase`** — `amount`, `project_id`, `milestone_id`

**`PaymentCreate`** — `PaymentBase`

**`PaymentRead`** — `PaymentBase` + `id`, `payment_status` (`PaymentStatus`), `payment_method` (`PaymentMethod | None`), `payment_date` (`datetime | None`)

**`PaymentUpdate`** — optional `amount`

**`PaymentStatus`**: `pending`, `paid`, `failed`, `refunded`, `cancelled`

**`PaymentMethod`**: `credit_card`, `debit_card`, `paypal`, `stripe`, `other`

---

## Notes — `/api/v1/notes`

| Method   | Path            | Description                                              |
| -------- | --------------- | -------------------------------------------------------- |
| `POST`   | `/`             | **Body:** `NoteCreate`. **Response `data`:** `NoteRead`. |
| `GET`    | `/{project_id}` | First route: notes by **project** (`NoteListResponse`).  |
| `GET`    | `/{meeting_id}` | Same path pattern—ambiguous with above.                  |
| `PUT`    | `/{note_id}`    | **Body:** `NoteUpdate`. **Response `data`:** `NoteRead`. |
| `DELETE` | `/{note_id}`    | **Response `data`:** `bool`.                             |

### Note schemas (`app/entities/note/schema.py`)

**`NoteBase`** — `content`, `type` (`Type`: `shared` | `private`), `project_id`, `user_id`, `meeting_id` optional

**`NoteCreate`** — `NoteBase`

**`NoteRead`** — `NoteBase` + `id`

**`NoteUpdate`** — optional `content`, `type`

**`NoteListResponse`** — `private: NoteRead | None`, `shared: NoteRead | None` (see service for how lists are populated)

---

## Notifications — `/api/v1/notifications`

| Method   | Path                 | Description                                                                                                                                                 |
| -------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST`   | `/`                  | **Body:** `NotificationCreate`. **Response `data`:** `NotificationRead`.                                                                                    |
| `GET`    | `/`                  | Current user’s notifications. **Query:** `offset`, `limit`, `is_read`, `notification_type`. **Auth:** JWT. **Response `data`:** `NotificationListResponse`. |
| `GET`    | `/unread-count`      | **Auth:** JWT. **Response `data`:** `NotificationCountResponse`.                                                                                            |
| `PUT`    | `/mark-read`         | **Body:** `NotificationMarkRead`. **Auth:** JWT. **Response `data`:** `NotificationCountResponse`.                                                          |
| `PUT`    | `/mark-all-read`     | **Auth:** JWT. **Response `data`:** `NotificationCountResponse`.                                                                                            |
| `DELETE` | `/{notification_id}` | **Auth:** JWT. **Response `data`:** `bool`.                                                                                                                 |

Static paths (`/unread-count`, `/mark-read`, …) are defined after `GET /` but before `DELETE /{id}` where relevant—ensure `GET /unread-count` is registered before `GET /{something}` if you add path params to `GET /`.

### Notification schemas (`app/entities/notification/schema.py`)

**`NotificationBase`** — `notification_type` (`NotificationType`), `priority` (`NotificationPriority`, default `MEDIUM`), `title`, `message`, `action_url`, `action_label`, `notification_data` (`dict | None`)

**`NotificationCreate`** — `NotificationBase` + `user_id`

**`NotificationRead`** — `NotificationBase` + `id`, `user_id`, `is_read`, `read_at`, `created_at`

**`NotificationMarkRead`** — `notification_ids: int[]` (min length 1)

**`NotificationListResponse`** — `results: NotificationRead[]`, `total`, `offset`, `limit`

**`NotificationCountResponse`** — `count`, `message`

**`NotificationType`** / **`NotificationPriority`**: see model in [`app/entities/notification/model.py`](app/entities/notification/model.py). **`notification_data`** contracts per type are documented in `NOTIFICATION_DATA_CONTRACTS` in [`app/entities/notification/schema.py`](app/entities/notification/schema.py).

---

## Waitlists — `/api/v1/waitlists`

| Method | Path                         | Description                                                      |
| ------ | ---------------------------- | ---------------------------------------------------------------- |
| `POST` | ``(empty path →`/waitlists`) | **Body:** `WaitlistCreate`. **Response `data`:** `WaitlistRead`. |
| `GET`  | ``                           | List entries. **Response `data`:** `WaitlistRead[]`.             |

### Waitlist schemas (`app/entities/waitlist/schema.py`)

**`WaitlistBase`** — `name`, `email`, `city`

**`WaitlistCreate`** — `WaitlistBase`

**`WaitlistRead`** — `WaitlistBase` + `id`

---

## Routing caveats (duplicate `{param}` paths)

Several routers declare **two `GET` routes with the same path pattern** (e.g. `GET /{project_id}` and `GET /{meeting_id}`). FastAPI uses **declaration order**: the **first** route wins, so the second may never run for `GET`. Prefer explicit prefixes (e.g. `/by-project/{id}`, `/by-meeting/{id}`) when refactoring.

---

## Schema file index

| Domain       | File                                                                         |
| ------------ | ---------------------------------------------------------------------------- |
| User         | [`app/entities/user/schema.py`](app/entities/user/schema.py)                 |
| Project      | [`app/entities/project/schema.py`](app/entities/project/schema.py)           |
| Milestone    | [`app/entities/milestone/schema.py`](app/entities/milestone/schema.py)       |
| Task         | [`app/entities/task/schema.py`](app/entities/task/schema.py)                 |
| Comment      | [`app/entities/comment/schema.py`](app/entities/comment/schema.py)           |
| Activity log | [`app/entities/activity_log/schema.py`](app/entities/activity_log/schema.py) |
| Meeting      | [`app/entities/meetings/schema.py`](app/entities/meetings/schema.py)         |
| File         | [`app/entities/file/schema.py`](app/entities/file/schema.py)                 |
| Payment      | [`app/entities/payment/schema.py`](app/entities/payment/schema.py)           |
| Note         | [`app/entities/note/schema.py`](app/entities/note/schema.py)                 |
| Notification | [`app/entities/notification/schema.py`](app/entities/notification/schema.py) |
| Waitlist     | [`app/entities/waitlist/schema.py`](app/entities/waitlist/schema.py)         |
| API envelope | [`app/core/response.py`](app/core/response.py)                               |

---

## Local seed credentials

For development logins after running the seed script, see [SEED_CREDENTIALS.md](SEED_CREDENTIALS.md) (if present in the repo).
