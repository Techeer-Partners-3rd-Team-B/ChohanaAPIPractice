import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  // input 파일 엘리먼트에 접근하기 위한 ref
  const inputRef = useRef();

  // todo, 입력 텍스트 및 선택된 이미지 파일을 관리
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [imageFile, setImageFile] = useState();

  const [mode, setMode] = useState("all");
  const [tempNode, setTempNode] = useState([]);

  // 파일 선택을 처리
  const onLoadFile = (e) => {
    if (e.target.files) {
      setImageFile(e.target.files[0]);
    }
  };

  // 서버에서 todos를 가져옴 (새로고침 시 실행되는 듯)
  const getTodos = async () => {
    const response = await axios.get("/api/todos");
    setTodos(response.data.todos);
    setTempNode(response.data.todos);
    // 가져온 투두
    // console.log("getTodos:\n", response.data.todos);
  };

  // 새로운 todo를 생성하는 함수
  const createTodo = async (e) => {
    e.preventDefault();

    if (input === "") return;

    // 파일 데이터를 보내기 위한 FormData 생성
    const formData = new FormData();

    formData.append("todoData", input);
    formData.append("file", imageFile);

    // (추가) formData에 저장된 값
    for (const entry of formData.entries()) {
      console.log(entry);
    }

    const response = await axios.post("/api/todos", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // 새로운 todo로 todos 상태 업데이트
    setTodos((prev) => [...prev, response.data]);
    setTempNode((prev) => [...prev, response.data]);
    // 입력 필드 초기화
    setInput("");
    setImageFile(null);
    inputRef.current.value = null;
  };

  // id로 삭제
  const deleteTodo = async (id) => {
    console.log("D) id: ", id);
    await axios.delete(`/api/todos/${id}`);
    const filteredTodos = todos.filter((todo) => todo.id !== id);
    setTodos(filteredTodos);
    setTempNode(todos);
  };

  // 체크박스 상태관리
  const updateTodo = async (id) => {
    const response = await axios.put(`/api/todos/${id}`);
    const updateTodos = todos.map((todo) =>
      todo.id === id ? response.data : todo
    );
    setTodos(updateTodos);
    setTempNode(todos);
  };

  const changeMode = async (mode) => {
    setMode(mode);
    if (mode === "active") {
      const temp = todos.filter((todo) => todo.done === false);
      setTempNode(temp);
    } else if (mode === "completed") {
      const temp = todos.filter((todo) => todo.done === true);
      setTempNode(temp);
    } else {
      setTempNode(todos);
    }
  };

  useEffect(() => {
    getTodos();
  }, []);

  // 패딩 처리가 아래는 왜 안 되는 거지?
  return (
    <div className="container">
      <form className="todoFormWrapper" onSubmit={createTodo}>
        <input
          type="text"
          placeholder="해야할 일을 입력해주세요..."
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
        />
        <label htmlFor="file">
          <svg
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              clipRule="evenodd"
              fillRule="evenodd"
              d="M19.5 21a3 3 0 003-3V9a3 3 0 00-3-3h-5.379a.75.75 0 01-.53-.22L11.47 3.66A2.25 2.25 0 009.879 3H4.5a3 3 0 00-3 3v12a3 3 0 003 3h15zm-6.75-10.5a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25v2.25a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V10.5z"
            />
          </svg>
          {/* 사진 첨부 시 텍스트 */}
          {imageFile ? "첨부됨👍" : "파일 첨부"}
        </label>
        <input id="file" ref={inputRef} type="file" onChange={onLoadFile} />
        <label htmlFor="create">
          <svg
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
          업로드
        </label>
        <button id="create" onClick={createTodo}>
          생성
        </button>
      </form>

      <div className="todoListWrapper">
        <ul className="filterBox">
          <li
            className={mode === "all" ? "shine" : ""}
            onClick={() => changeMode("all")}
          >
            ALL
          </li>
          <li
            className={mode === "completed" ? "shine" : ""}
            onClick={() => changeMode("completed")}
          >
            완료
          </li>
          <li
            className={mode === "active" ? "shine" : ""}
            onClick={() => changeMode("active")}
          >
            진행중
          </li>
        </ul>

        <ul className="todoList">
          {tempNode.map((todo) => (
            <li key={todo.id} className="todoWrapper">
              <label htmlFor={`input${todo.id}`}>
                {todo.done ? (
                  <svg
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      clipRule="evenodd"
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                    />
                  </svg>
                ) : (
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
              </label>
              <input
                id={`input${todo.id}`}
                type="checkbox"
                className="displayNone"
                checked={todo.done}
                onChange={() => updateTodo(todo.id)}
              />
              {todo.thumbnail && (
                <img
                  className="thumbnail"
                  src={todo.thumbnail}
                  alt="thumbnail"
                />
              )}
              <span className={todo.done ? "done" : ""}>{todo.title}</span>
              <label htmlFor={`delete${todo.id}`}>
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    s
                    d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z"
                  />
                </svg>
              </label>
              <button
                id={`delete${todo.id}`}
                className="displayNone"
                onClick={() => deleteTodo(todo.id)}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
