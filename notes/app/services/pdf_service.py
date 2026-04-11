import io
from app.models.Note import Note
from weasyprint import HTML, CSS
from typing import Any, List


class PDFService:
    @staticmethod
    def _parse_json_to_html(node: Any) -> str:
        """
        Rekurencyjnie konwertuje JSON (format TipTap/Slate) na HTML.
        Obsługuje specyficzne wymagania dotyczące tabel i mediów.
        """
        if isinstance(node, list):
            return "".join(PDFService._parse_json_to_html(child) for child in node)
        
        if not isinstance(node, dict):
            return str(node)

        node_type = node.get("type")
        attrs = node.get("attrs", {})
        content = node.get("content", [])
        inner_html = PDFService._parse_json_to_html(content)

        if node_type == "text":
            text = node.get("text", "")
            # Obsługa formatowania tekstu (marks)
            for mark in node.get("marks", []):
                if mark["type"] == "bold": text = f"<b>{text}</b>"
                if mark["type"] == "italic": text = f"<i>{text}</i>"
            return text

        mapping = {
            "doc": f"{inner_html}",
            "paragraph": f"<p>{inner_html}</p>",
            "heading": f"<h{attrs.get('level', 1)}>{inner_html}</h{attrs.get('level', 1)}>",
            "bulletList": f"<ul>{inner_html}</ul>",
            "orderedList": f"<ol>{inner_html}</ol>",
            "listItem": f"<li>{inner_html}</li>",
            # Tabele: brak marginesów, szerokość 100%
            "table": f'<table class="custom-table">{inner_html}</table>',
            "tableRow": f"<tr>{inner_html}</tr>",
            # Komórki: brak paddingu, brak wymuszonego pogrubienia (nawet w nagłówkach)
            "tableCell": f"<td>{inner_html}</td>",
            "tableHeader": f"<td>{inner_html}</td>",
            "image": f'<div class="media-container"><img src="{attrs.get("src")}" /></div>',
            "video": f'<div class="media-container"><img src="{attrs.get("thumbnail_url")}" /><p>(Wideo: {attrs.get("src")})</p></div>',
            "note_link": f'<a href="#">[Notatka: {attrs.get("id")}]</a>'
        }

        return mapping.get(node_type, f"<div>{inner_html}</div>")

    @staticmethod
    async def generate_note_pdf(note: Note) -> io.BytesIO:
        """
        Konwertuje treść notatki na PDF.
        """
        # 1. Przygotowanie treści HTML
        content_html = PDFService._parse_json_to_html(note.content) if note.content else ""
        
        full_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>{note.name}</title>
            <style>
                body {{ font-family: 'DejaVu Sans', sans-serif; line-height: 1.6; color: #333; }}
                h1 {{ color: #1a202c; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }}
                
                /* Specyficzne style dla tabel */
                .custom-table {{ 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin: 0 !important; /* Brak przestrzeni nad i pod */
                    padding: 0 !important;
                }}
                .custom-table td {{ 
                    border: 1px solid #cbd5e0; 
                    padding: 0 !important; /* Brak paddingu wewnątrz komórek */
                    font-weight: normal !important; /* Brak pogrubienia */
                    text-align: center; /* Wycentrowane */
                }}
                
                /* Kontener dla mediów */
                .media-container {{
                    text-align: center;
                    margin: 1rem 0;
                }}
                .media-container img {{
                    max-width: 100%;
                    height: auto;
                    border-radius: 8px;
                }}
            </style>
        </head>
        <body>
            <h1>{note.name}</h1>
            <div class="content">
                {content_html}
            </div>
        </body>
        </html>
        """

        # 2. Renderowanie do PDF przy użyciu WeasyPrint
        pdf_bytes = HTML(string=full_html).write_pdf()
        
        buffer = io.BytesIO(pdf_bytes)
        buffer.seek(0)
        return buffer
