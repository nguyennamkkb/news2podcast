import mistune


def parse_content(text: str) -> dict:
    """Parse markdown or plain text into structured content."""
    if not text or not text.strip():
        return {"title": "", "headings": [], "paragraphs": [], "code_blocks": [], "word_count": 0}

    md = mistune.create_markdown(renderer=None)
    result = md.parse(text)
    tokens = result[0] if isinstance(result, tuple) else result

    structure = {"title": "", "headings": [], "paragraphs": [], "code_blocks": [], "word_count": 0}

    for token in tokens:
        if token["type"] == "heading":
            level = token.get("attrs", {}).get("level", 0)
            text_content = token["children"][0].get("raw", "") if token.get("children") else ""
            structure["headings"].append({"level": level, "text": text_content})
            if level == 1 and not structure["title"]:
                structure["title"] = text_content
        elif token["type"] == "paragraph":
            text_content = token["children"][0].get("raw", "") if token.get("children") else ""
            clean = text_content.strip()
            if clean:
                structure["paragraphs"].append(clean)
                structure["word_count"] += len(clean.split())
        elif token["type"] == "block_code":
            structure["code_blocks"].append(token.get("raw", ""))

    return structure