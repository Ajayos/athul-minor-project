import AppRouter from "./routes/AppRouter";
import AppLayout from "./components/AppLayout";

function App() {
  return (
    <AppLayout>
      <AppRouter />
    </AppLayout>
  );
}

export default App;
