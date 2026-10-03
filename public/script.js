const MAX_WORDS = 500;

const state = {
  writers: [],
  readers: [],
  posts: [],
  search: "",
};

const elements = {
  message: document.getElementById("message"),
  postForm: document.getElementById("post-form"),
  postId: document.getElementById("post-id"),
  postTitle: document.getElementById("post-title"),
  postWriter: document.getElementById("post-writer"),
  postContent: document.getElementById("post-content"),
  wordCount: document.getElementById("word-count"),
  postSubmit: document.getElementById("post-submit"),
  postCancel: document.getElementById("post-cancel"),
  searchForm: document.getElementById("search-form"),
  searchInput: document.getElementById("search-input"),
  searchClear: document.getElementById("search-clear"),
  readerSelect: document.getElementById("reader-select"),
  postList: document.getElementById("post-list"),
  writerForm: document.getElementById("writer-form"),
  writerName: document.getElementById("writer-name"),
  writerEmail: document.getElementById("writer-email"),
  writerList: document.getElementById("writer-list"),
  readerForm: document.getElementById("reader-form"),
  readerName: document.getElementById("reader-name"),
  readerEmail: document.getElementById("reader-email"),
  readerList: document.getElementById("reader-list"),
};

let messageTimer = null;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function countWords(text) {
  const clean = text.trim();
  return clean ? clean.split(/\s+/).length : 0;
}

function showMessage(text, type) {
  elements.message.textContent = text;
  elements.message.className = `message ${type}`;
  clearTimeout(messageTimer);
  messageTimer = setTimeout(() => {
    elements.message.className = "message hidden";
  }, 5000);
}

async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (response.status === 204) return null;
  const data = await response.json();
  if (!response.ok) throw new Error(data.erro || "Request failed");
  return data;
}

async function loadWriters() {
  state.writers = await request("/escritores");
  renderWriters();
}

async function loadReaders() {
  state.readers = await request("/leitores");
  renderReaders();
}

async function loadPosts() {
  const query = state.search ? `?q=${encodeURIComponent(state.search)}` : "";
  state.posts = await request(`/posts${query}`);
  renderPosts();
}

function renderWriters() {
  if (state.writers.length === 0) {
    elements.writerList.innerHTML = "<p class=\"empty\">No writers yet.</p>";
  } else {
    elements.writerList.innerHTML = state.writers
      .map(
        (writer) => `
        <div class="row">
          <span>${escapeHtml(writer.nome)} (${escapeHtml(writer.email)})</span>
          <button class="secondary" data-action="delete-writer" data-id="${writer.id}">Delete</button>
        </div>`
      )
      .join("");
  }

  const selected = elements.postWriter.value;
  elements.postWriter.innerHTML = state.writers
    .map((writer) => `<option value="${writer.id}">${escapeHtml(writer.nome)}</option>`)
    .join("");
  if (selected) elements.postWriter.value = selected;
}

function renderReaders() {
  if (state.readers.length === 0) {
    elements.readerList.innerHTML = "<p class=\"empty\">No readers yet.</p>";
  } else {
    elements.readerList.innerHTML = state.readers
      .map(
        (reader) => `
        <div class="row">
          <span>${escapeHtml(reader.nome)} (${escapeHtml(reader.email)})</span>
        </div>`
      )
      .join("");
  }

  const selected = elements.readerSelect.value;
  elements.readerSelect.innerHTML = state.readers
    .map((reader) => `<option value="${reader.id}">${escapeHtml(reader.nome)}</option>`)
    .join("");
  if (selected) elements.readerSelect.value = selected;
}

function renderPosts() {
  if (state.posts.length === 0) {
    elements.postList.innerHTML = "<p class=\"empty\">No posts found.</p>";
    return;
  }

  elements.postList.innerHTML = state.posts
    .map((post) => {
      const writer = state.writers.find((item) => item.id === post.escritorId);
      const writerName = writer ? writer.nome : "Unknown writer";
      const date = new Date(post.criadoEm).toLocaleDateString("en-US");
      return `
      <article class="card">
        <h3>${escapeHtml(post.titulo)}</h3>
        <p class="meta">By ${escapeHtml(writerName)} | ${post.palavras} words | ${date}</p>
        <p class="content">${escapeHtml(post.conteudo)}</p>
        <div class="actions">
          <button data-action="edit-post" data-id="${post.id}">Edit</button>
          <button class="secondary" data-action="delete-post" data-id="${post.id}">Delete</button>
          <button class="secondary" data-action="read-post" data-id="${post.id}">Mark as read</button>
        </div>
      </article>`;
    })
    .join("");
}

function updateWordCount() {
  const total = countWords(elements.postContent.value);
  elements.wordCount.textContent = `${total} / ${MAX_WORDS} words`;
  elements.wordCount.classList.toggle("over", total > MAX_WORDS);
}

function resetPostForm() {
  elements.postForm.reset();
  elements.postId.value = "";
  elements.postWriter.disabled = false;
  elements.postSubmit.textContent = "Publish post";
  elements.postCancel.classList.add("hidden");
  updateWordCount();
}

function startEditing(postId) {
  const post = state.posts.find((item) => item.id === postId);
  if (!post) return;
  elements.postId.value = post.id;
  elements.postTitle.value = post.titulo;
  elements.postContent.value = post.conteudo;
  elements.postWriter.value = post.escritorId;
  elements.postWriter.disabled = true;
  elements.postSubmit.textContent = "Save changes";
  elements.postCancel.classList.remove("hidden");
  updateWordCount();
  elements.postForm.scrollIntoView({ behavior: "smooth" });
}

async function handlePostSubmit(event) {
  event.preventDefault();
  const id = elements.postId.value;
  try {
    if (id) {
      await request(`/posts/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          titulo: elements.postTitle.value,
          conteudo: elements.postContent.value,
        }),
      });
      showMessage("Post updated.", "success");
    } else {
      await request("/posts", {
        method: "POST",
        body: JSON.stringify({
          titulo: elements.postTitle.value,
          conteudo: elements.postContent.value,
          escritorId: Number(elements.postWriter.value),
        }),
      });
      showMessage("Post published.", "success");
    }
    resetPostForm();
    await loadPosts();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function handleWriterSubmit(event) {
  event.preventDefault();
  try {
    await request("/escritores", {
      method: "POST",
      body: JSON.stringify({
        nome: elements.writerName.value,
        email: elements.writerEmail.value,
      }),
    });
    elements.writerForm.reset();
    showMessage("Writer added.", "success");
    await loadWriters();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function handleReaderSubmit(event) {
  event.preventDefault();
  try {
    await request("/leitores", {
      method: "POST",
      body: JSON.stringify({
        nome: elements.readerName.value,
        email: elements.readerEmail.value,
      }),
    });
    elements.readerForm.reset();
    showMessage("Reader added.", "success");
    await loadReaders();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function handlePostListClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const id = Number(button.dataset.id);
  const action = button.dataset.action;

  try {
    if (action === "edit-post") {
      startEditing(id);
    }
    if (action === "delete-post") {
      if (!confirm("Delete this post?")) return;
      await request(`/posts/${id}`, { method: "DELETE" });
      showMessage("Post deleted.", "success");
      await loadPosts();
    }
    if (action === "read-post") {
      const readerId = Number(elements.readerSelect.value);
      if (!readerId) {
        showMessage("Add a reader first.", "error");
        return;
      }
      await request(`/posts/${id}/leituras`, {
        method: "POST",
        body: JSON.stringify({ leitorId: readerId }),
      });
      showMessage("Reading registered.", "success");
    }
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function handleWriterListClick(event) {
  const button = event.target.closest("button[data-action=\"delete-writer\"]");
  if (!button) return;
  if (!confirm("Delete this writer?")) return;
  try {
    await request(`/escritores/${button.dataset.id}`, { method: "DELETE" });
    showMessage("Writer deleted.", "success");
    await loadWriters();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function handleSearch(event) {
  event.preventDefault();
  state.search = elements.searchInput.value.trim();
  loadPosts().catch((error) => showMessage(error.message, "error"));
}

function handleSearchClear() {
  elements.searchInput.value = "";
  state.search = "";
  loadPosts().catch((error) => showMessage(error.message, "error"));
}

async function init() {
  elements.postForm.addEventListener("submit", handlePostSubmit);
  elements.postCancel.addEventListener("click", resetPostForm);
  elements.postContent.addEventListener("input", updateWordCount);
  elements.searchForm.addEventListener("submit", handleSearch);
  elements.searchClear.addEventListener("click", handleSearchClear);
  elements.postList.addEventListener("click", handlePostListClick);
  elements.writerForm.addEventListener("submit", handleWriterSubmit);
  elements.writerList.addEventListener("click", handleWriterListClick);
  elements.readerForm.addEventListener("submit", handleReaderSubmit);

  try {
    await Promise.all([loadWriters(), loadReaders()]);
    await loadPosts();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

init();
