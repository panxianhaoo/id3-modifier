import "./App.css";

function App() {
  return (
    <main className="container">
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <h1 className="text-red-500">123</h1>
      <button onClick={()=>console.log(1)}>Click Me</button>
    </main>
  );
}

export default App;
