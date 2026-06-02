from app.temporal.activities.parse_content import parse_content


def test_parse_markdown_with_headings():
    text = "# Tin tức hôm nay\n\nThị trường chứng khoán tăng.\n\nGiá vàng lập đỉnh."
    result = parse_content(text)
    assert result["title"] == "Tin tức hôm nay"
    assert result["word_count"] > 0
    assert len(result["paragraphs"]) == 2


def test_parse_empty_text():
    result = parse_content("")
    assert result["word_count"] == 0
    assert result["paragraphs"] == []