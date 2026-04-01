import re

with open("src/components/DashboardPreview.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# 1. Update fetchDocuments to use user_id
text = re.sub(
    r"""const res = await axios\.get\([\s\S]+?"http://localhost:8000/api/v1/documents\?user_id=guest_user"[\s\S]+?\);""",
    r"""const userId = localStorage.getItem("user_id") || "guest_user";
      const res = await axios.get(
        `http://localhost:8000/api/v1/documents?user_id=${encodeURIComponent(userId)}`
      );""",
    text,
)

# 2. Add handleDownload and handleRemoveDuplicates
funcs = """
  const handleDownload = async (docId: string, filename: string) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/v1/documents/${docId}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error("Failed to download document", error);
      alert("Download failed.");
    }
  };

  const handleRemoveDuplicates = async () => {
    const userId = localStorage.getItem("user_id") || "guest_user";
    try {
      setLoadingDocs(true);
      const response = await axios.delete(`http://localhost:8000/api/v1/documents/duplicates?user_id=${encodeURIComponent(userId)}`);
      alert(response.data.message || "Duplicates removed");
      await fetchDocuments();
    } catch (error) {
      console.error("Failed to remove duplicates", error);
      alert("Failed to remove duplicates.");
      setLoadingDocs(false);
    }
  };
"""
text = text.replace(
    "const fetchDocuments = async () => {",
    funcs + "\n  const fetchDocuments = async () => {",
)

# 3. Add Remove Duplicates button
remove_btn = """
            <div className="flex gap-4">
              <button
                onClick={handleRemoveDuplicates}
                className="flex items-center gap-1 text-xs text-destructive hover:text-red-500 transition-colors"
              >
                Remove Duplicates
              </button>
              <button
                onClick={fetchDocuments}"""

text = text.replace("<button\n              onClick={fetchDocuments}", remove_btn)
text = text.replace(
    '              Refresh\n            </button>\n          </div>\n          <div className="overflow-x-auto">',
    '              Refresh\n            </button>\n            </div>\n          </div>\n          <div className="overflow-x-auto">',
)


# 4. Bind download button
text = text.replace(
    r"""<button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-xs font-medium transition-colors">""",
    r"""<button onClick={() => handleDownload(doc.id, doc.filename)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-xs font-medium transition-colors">""",
)

with open("src/components/DashboardPreview.tsx", "w", encoding="utf-8") as f:
    f.write(text)

print("Patched DashboardPreview.tsx")
