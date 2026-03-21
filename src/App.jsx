import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("amigapad-tabs");
    if (saved) {
      const parsed = JSON.parse(saved);
      setTabs(parsed);
      setActiveTab(parsed[0]?.id || null);
    } else {
      createNewTab();
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem("amigapad-tabs", JSON.stringify(tabs));
  }, [tabs]);

  const createNewTab = () => {
    const newTab = {
      id: Date.now(),
      name: "Untitled",
      content: "",
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTab(newTab.id);
  };

  const closeTab = (id) => {
    const filtered = tabs.filter((tab) => tab.id !== id);
    setTabs(filtered);

    if (id === activeTab && filtered.length > 0) {
      setActiveTab(filtered[0].id);
    }
  };

  const updateContent = (id, content) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === id ? { ...tab, content } : tab
      )
    );
  };

  const active = tabs.find((t) => t.id === activeTab);

  return (
    <div className="app">
      <div className="toolbar">
        <button onClick={createNewTab}>New Tab</button>
      </div>

      <div className="tabs">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab ${tab.id === activeTab ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.name}
            <span
              className="close"
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
            >
              ×
            </span>
          </div>
        ))}
      </div>

      <div className="editor">
        {active && (
          <textarea
            value={active.content}
            onChange={(e) =>
              updateContent(active.id, e.target.value)
            }
            placeholder="Start typing..."
          />
        )}
      </div>
    </div>
  );
}

export default App;