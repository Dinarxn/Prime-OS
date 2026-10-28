/**
 * RFC 4180 Compliant CSV Parser
 * Handles commas inside quotes, escaped quotes (""), newlines within cells, and UTF-8 characters.
 */
export interface CsvParseResult {
  headers: string[];
  rows: Record<string, string>[];
  totalLines: number;
  error?: string;
}

export function parseCsvText(text: string): CsvParseResult {
  // Strip UTF-8 Byte Order Mark (BOM) if present
  const cleanText = text.replace(/^\uFEFF/, "");
  if (!cleanText.trim()) {
    return { headers: [], rows: [], totalLines: 0, error: "CSV file is empty" };
  }

  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote: "" -> "
          currentCell += '"';
          i++;
        } else {
          // Closing quote
          inQuotes = false;
        }
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        currentRow.push(currentCell.trim());
        currentCell = "";
      } else if (char === "\r") {
        if (nextChar === "\n") i++;
        currentRow.push(currentCell.trim());
        lines.push(currentRow);
        currentRow = [];
        currentCell = "";
      } else if (char === "\n") {
        currentRow.push(currentCell.trim());
        lines.push(currentRow);
        currentRow = [];
        currentCell = "";
      } else {
        currentCell += char;
      }
    }
  }

  // Handle final row if text didn't end with newline
  if (currentCell !== "" || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    lines.push(currentRow);
  }

  // Filter out empty rows
  const nonEmptyLines = lines.filter((line) => line.some((cell) => cell.length > 0));
  if (nonEmptyLines.length === 0) {
    return { headers: [], rows: [], totalLines: 0, error: "No data rows found in CSV" };
  }

  const rawHeaders = nonEmptyLines[0];
  const headers = rawHeaders.map((h, idx) => h.trim() || `column_${idx + 1}`);

  const rows: Record<string, string>[] = [];
  for (let r = 1; r < nonEmptyLines.length; r++) {
    const line = nonEmptyLines[r];
    const rowObj: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) {
      rowObj[headers[c]] = line[c] ?? "";
    }
    rows.push(rowObj);
  }

  return {
    headers,
    rows,
    totalLines: rows.length,
  };
}

