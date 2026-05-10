export function parseJsonSafe<T>(raw: string): T {
  try {
    return JSON.parse(raw);
  } catch {
    // continue
  }

  const markdownMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (markdownMatch) {
    try {
      return JSON.parse(markdownMatch[1].trim());
    } catch {
      // continue
    }
  }

  const startArray = raw.indexOf("[");
  const startObj = raw.indexOf("{");
  let start = -1;

  if (startArray === -1 && startObj === -1) {
    throw new Error("No JSON found in response");
  }

  if (startArray === -1) start = startObj;
  else if (startObj === -1) start = startArray;
  else start = Math.min(startArray, startObj);

  const isArray = raw[start] === "[";
  const endChar = isArray ? "]" : "}";

  const end = raw.lastIndexOf(endChar);
  if (end === -1 || end <= start) {
    throw new Error("Malformed JSON in response");
  }

  const extracted = raw.substring(start, end + 1);
  return JSON.parse(extracted);
}
