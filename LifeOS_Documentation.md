# Dokumentacja LifeOS - Architektura i Endpointy

LifeOS to rozbudowany system zbudowany w architekturze mikroserwisowej do kompleksowego zarządzania życiem. Został podzielony na niezależne serwisy obsługujące różne dziedziny, połączone wspólną biblioteką `common_lib`.

## Spis Mikroserwisów
1. **Auth** - Zarządzanie użytkownikami, uwierzytelnianie (konta, 2FA, tokeny, logowanie).
2. **Notes** - Notatnik, struktura folderów i fiszki, w tym system oparty na powtórkach (Spaced Repetition System).
3. **Tasks** - System zadań z grywalizacją (cele, serie/streaks, nagrody, poziomy doświadczenia).
4. **Workout** - Śledzenie treningów, postępów, ćwiczeń oraz przeprowadzanie aktywnych sesji treningowych na żywo.
5. **Social Media Aggregator** - Agregator postów (scrappery dla np. Twitcha) grupujący feed twórców z różnych mediów w jednym miejscu.
6. **Common (common_lib)** - Wspólna biblioteka zawierająca wyjątki, zdrowie(healthchecks), weryfikację JWT, limitowanie zapytań (rate limiting), dostęp do bazy danych i logowanie.

---

## Szczegółowe Endpointy z podziałem na moduły

### 1. **Auth Service**

#### Użytkownicy (`/users`)
- `POST /users` - Tworzenie użytkownika
- `GET /users` - Lista użytkowników (admin)
- `GET /users/{user_id}` - Szczegóły użytkownika (admin)
- `PATCH /users/{user_id}` - Aktualizacja użytkownika (admin)
- `PATCH /users/me` - Aktualizacja własnego profilu
- `DELETE /users/{user_id}` - Usuwanie (admin)
- `DELETE /users/me` - Usuwanie swojego konta

#### Autoryzacja (`/auth`)
- `POST /auth/token` - Logowanie e-mail/hasło (wsparcie MFA) - Rate limit (20/h)
- `POST /auth/refresh` - Odświeżanie tokena
- `POST /auth/logout` - Wylogowanie 
- `GET /auth/sessions` - Aktywne sesje logowania
- `POST /auth/logout/{sid}` - Wylogowywanie sesji po ID
- `PATCH /auth/activate/{activate_token}` - Aktywacja konta
- `PATCH /auth/change_superuser_status/{user_id}` - Zmiana statusu admina
- `POST /auth/forgot_password` - Reset hasła 
- `PATCH /auth/change_password/{password_change_token}` - Zmiana hasła 

#### 2FA (`/2fa`)
- `POST /2fa/setup` - Generowanie klucza 2FA
- `POST /2fa/enable` - Włączenie 2FA
- `POST /2fa/disable` - Wyłączenie 2FA

#### Klucze API (`/apikeys`)
- `POST /apikeys` - Stworzenie nowego klucza API
- `GET /apikeys` - Lista kluczy API użytkownika
- `DELETE /apikeys/{key_id}` - Usunięcie klucza API

---

### 2. **Notes Service**

#### Notatki (`/`)
- `POST /` - Nowa notatka
- `GET /` - Lista notatek
- `GET /search` - Wyszukiwarka notatek
- `GET /{note_id}` - Szczegóły notatki 
- `PATCH /{note_id}` - Aktualizacja
- `DELETE /{note_id}` - Usunięcie
- `POST /{note_id}/move` - Przenoszenie notatki do folderu
- `GET /{note_id}/pdf` - Eksport do PDF

#### Foldery (`/`)
- `POST /` - Nowy folder
- `GET /` - Lista folderów
- `GET /{folder_id}` - Szczegóły folderu
- `PATCH /{folder_id}` - Aktualizacja folderu
- `DELETE /{folder_id}` - Usunięcie
- `POST /{folder_id}/move` - Przenoszenie folderu

#### System Powtórk (Spaced Repetition System) (`/`)
- `GET /due` - Co jest do powtórzenia na dziś
- `GET /difficult` - Trudne i nowe fiszki do nauki
- `POST /review` - Odpowiedź po teście (aktualizacja algorytmu SRS)
- `POST /reset/{item_type}/{item_id}` - Resetowanie postępów algorytmu na danej fiszce

---

### 3. **Tasks Service**

#### Zadania (`/tasks`)
- `POST /tasks` - Dodanie zadania
- `GET /tasks` - Lista zadań
- `GET /tasks/{task_id}` - Szczegóły
- `PATCH /tasks/{task_id}` - Edycja
- `DELETE /tasks/{task_id}` - Usunięcie
- `POST /tasks/{task_id}/done` - Oznaczenie jako wykonane (zaliczenie expa itd.)
- `POST /tasks/{task_id}/undone` - Cofnięcie wykonania

#### Cele (`/goals`)
- `POST /goals` - Nowy cel
- `GET /goals` - Lista celów
- `GET /goals/{goal_id}` - Zobacz punktowany postęp w celu
- `PATCH /goals/{goal_id}` - Aktualizacja
- `DELETE /goals/{goal_id}` - Usunięcie systemu postępu

#### Kategorie (`/categories`)
- `GET /categories/stats` - Statystyki wg dat/kategorii
- `POST /categories` - Dodaj kategorię
- `GET /categories` - Przegląd kateforii
- `GET /categories/{category_id}` - Szczegóły
- `PATCH /categories/{category_id}` - Zmiana nazwy/ikonki
- `DELETE /categories/{category_id}` - Usunięcie

#### Serie/Streaks (`/streaks`)
- `POST /streaks` - Nowy nawyk do śledzenia
- `GET /streaks` - Lista twoich streaks
- `GET /streaks/{streak_id}` - Dane o serii nawyków
- `PATCH /streaks/{streak_id}` - Akutalizuj
- `DELETE /streaks/{streak_id}` - Usuń streak

#### Sklep nagród (`/rewards` i `/vault` i `/reward-transactions`)
- `POST /rewards` - Stwórz nową nagrodę z ceną w punktach (monetach)
- `GET /rewards` - Lista dostepnych nagród
- `PATCH /rewards/{reward_id}` - Edycja nagrody
- `DELETE /rewards/{reward_id}` - Usunięcia elementu ze sklepu
- `POST /rewards/{reward_id}/claim` - Zakup / odbiór nagrody
- `POST /rewards/{reward_id}/unclaim` - Zwrot i cofncięcie
- `GET /vault/me` - Twój portfel i stan zasobów monet / punktów (EXP)
- `GET /reward-transactions` - Historia wymiany / wydawania punktów za zrealizowane zadania / odebrane nagrody.

---

### 4. **Workout Service**

#### Treningi (`/workout`)
- `POST /workout` - Konstruktor szablonu treningowego
- `GET /workout` - Gotowe szablony
- `GET /workout/{workout_id}` - Szczegóły 
- `PATCH /workout/{workout_id}` - Zmiana
- `DELETE /workout/{workout_id}` - Skasowanie szablonu

#### Operacje i Statystyki - Zestaw Ćwiczeń i Kroków
- `POST /exercise` - Dodanie do bazy wybranego ćwiczenia
- `GET /exercise` - Lista ćwiczeń
- `GET /statistics/exercise-progression/{exercise_id}` - Progres 
- `GET /statistics/workout-history-summary` - Podsumowanie historii wykonanych ćwiczeń
- `GET /statistics/user-total-stats` - Łączne globalne osiagniecia treningowe.

#### Zarządzanie Sesją (`/workout_session` i `/workout_step`)
- Mieszane operacje dodawania i rozpoczyniania treningów `live`. 
- Ustawianie stoperów, progresji, przerw, pauzowania iteracji poszczególnych setów/zestawów ćwiczeń (`/workout_session/start/{workout_id}`, `/pause`, `/resume`, `/next`, `/adjust`, `/finish`).

---

### 5. **Social Media Aggregator Service**

- Kanały RSS/Postów (`/feed/global`, `/feed/creator/{creator_id}`) pozwalające odpytać o agregacyjne nowości, ze wskazanych typów.
- Scraper (`/scraper/run/{platform_id}`, `/scraper/reset/{platform_id}`) umożliwia zarządzanie parserami pobierającymi treści o streamerach, twórcach, zintegrowane np. ze wspomnianym webhookowaniem Twitcha w ramach platform (`/creators`, `/platforms`).
