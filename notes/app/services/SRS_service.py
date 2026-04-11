from datetime import datetime, timezone
from typing import Tuple


class SRSService:
    @staticmethod
    def calculate_next_review(
        quality: int, interval: int, repetitions: int, easiness_factor: float
    ) -> Tuple[int, int, float]:
        """
        Algorytm SM-2
        quality: 0-5 (0: kompletna klapa, 5: idealnie)
        Zwraca: (nowy_interval, nowe_repetitions, nowy_easiness_factor)
        """
        if quality < 3:
            return 1, 0, easiness_factor

        if repetitions == 0:
            new_interval = 1
        elif repetitions == 1:
            new_interval = 6
        else:
            new_interval = round(interval * easiness_factor)

        new_repetitions = repetitions + 1

        new_easiness_factor = easiness_factor + (
            0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
        )
        if new_easiness_factor < 1.3:
            new_easiness_factor = 1.3

        return new_interval, new_repetitions, new_easiness_factor

    @staticmethod
    def get_reset_params() -> dict:
        """Zwraca parametry dla całkowitego resetu karty."""
        return {
            "interval": 0,
            "repetitions": 0,
            "easiness_factor": 2.5,
            "next_review": datetime.now(timezone.utc),
        }
