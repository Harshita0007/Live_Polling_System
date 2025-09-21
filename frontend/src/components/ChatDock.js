import React from "react";
import { MessageCircle, X } from "lucide-react";
import { PrimaryButton } from "./ui/Button";

export function ChatDock({
  open,
  onOpenChange,
  tab,
  setTab,
  messages,
  participants,
  chatText,
  setChatText,
  onSend,
  canKick,
  onKick,
}) {
  return React.createElement(
    "div",
    { style: { position: "fixed", right: "1.5rem", bottom: "1.5rem" } },
    !open &&
      React.createElement(
        "button",
        {
          onClick: function () { onOpenChange(true); },
          style: {
            borderRadius: "9999px",
            backgroundColor: "#8B5CF6",
            padding: "0.75rem",
            color: "white",
            boxShadow: "0 10px 15px rgba(0,0,0,0.1)",
            cursor: "pointer"
          },
        },
        React.createElement(MessageCircle, { size: 20 })
      ),
    open &&
      React.createElement(
        "div",
        {
          style: {
            height: "20rem",
            width: "20rem",
            borderRadius: "1rem",
            border: "1px solid #E5E7EB",
            backgroundColor: "white",
            boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
          },
        },
        // Header
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #E5E7EB",
              padding: "0.5rem",
            },
          },
          React.createElement(
            "div",
            { style: { display: "flex", gap: "0.5rem", fontSize: "0.875rem" } },
            React.createElement(
              "button",
              {
                onClick: function () { setTab("chat"); },
                style: Object.assign(
                  {
                    borderRadius: "0.25rem",
                    padding: "0.25rem 0.5rem",
                    cursor: "pointer",
                  },
                  tab === "chat" ? { backgroundColor: "#F3F4F6" } : {}
                ),
              },
              "Chat"
            ),
            React.createElement(
              "button",
              {
                onClick: function () { setTab("participants"); },
                style: Object.assign(
                  {
                    borderRadius: "0.25rem",
                    padding: "0.25rem 0.5rem",
                    cursor: "pointer",
                  },
                  tab === "participants" ? { backgroundColor: "#F3F4F6" } : {}
                ),
              },
              "Participants"
            )
          ),
          React.createElement(
            "button",
            {
              onClick: function () { onOpenChange(false); },
              style: { borderRadius: "0.25rem", padding: "0.25rem", cursor: "pointer" },
            },
            React.createElement(X, { size: 16 })
          )
        ),

        // Body
        tab === "chat"
          ? React.createElement(
              "div",
              { style: { flex: 1, display: "flex", flexDirection: "column" } },
              // Messages
              React.createElement(
                "div",
                {
                  style: {
                    flex: 1,
                    overflowY: "auto",
                    padding: "0.75rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  },
                },
                messages.map(function (m) {
                  return React.createElement(
                    "div",
                    { key: m.id, style: { fontSize: "0.875rem" } },
                    React.createElement("strong", null, m.userName + ": "),
                    m.message
                  );
                })
              ),
              // Input
              React.createElement(
                "div",
                { style: { borderTop: "1px solid #E5E7EB", padding: "0.5rem" } },
                React.createElement(
                  "div",
                  { style: { display: "flex", gap: "0.5rem" } },
                  React.createElement("input", {
                    value: chatText,
                    onChange: function (e) { setChatText(e.target.value); },
                    placeholder: "Type here...",
                    style: {
                      flex: 1,
                      borderRadius: "0.375rem",
                      border: "1px solid #E5E7EB",
                      padding: "0.5rem",
                      fontSize: "0.875rem",
                    },
                  }),
                  React.createElement(
                    PrimaryButton,
                    {
                      disabled: !chatText.trim(),
                      onClick: onSend,
                    },
                    "Send"
                  )
                )
              )
            )
          : // Participants Tab
            React.createElement(
              "div",
              {
                style: {
                  flex: 1,
                  overflowY: "auto",
                  padding: "0.75rem",
                  fontSize: "0.875rem",
                },
              },
              participants.length > 0
                ? participants.map(function (p) {
                    return React.createElement(
                      "div",
                      {
                        key: p.id,
                        style: {
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "0.25rem 0",
                        },
                      },
                      React.createElement(
                        "div",
                        null,
                        React.createElement("span", { style: { fontWeight: 500 } }, p.name),
                        " ",
                        React.createElement("span", { style: { color: "#9CA3AF" } }, "(" + p.role + ")")
                      ),
                      canKick && p.role !== "teacher"
                        ? React.createElement(
                            "button",
                            {
                              onClick: function () { onKick(p.id); },
                              style: { color: "#DC2626", cursor: "pointer", background: "none", border: "none" },
                            },
                            "Kick"
                          )
                        : null
                    );
                  })
                : React.createElement(
                    "p",
                    { style: { color: "#9CA3AF" } },
                    "No one connected."
                  )
            )
      )
  );
}

export default ChatDock;
