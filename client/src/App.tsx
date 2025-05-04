import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { StaticHabitProvider } from "@/context/StaticHabitContext";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <StaticHabitProvider>
      <Router />
      <Toaster />
    </StaticHabitProvider>
  );
}

export default App;
