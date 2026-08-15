package cmd

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"time"

	"github.com/fatih/color"
	"github.com/spf13/cobra"
)

type Note struct {
	ID        int       `json:"id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	Pinned    bool      `json:"pinned"`
}

var (
	notes    []Note
	dataFile string
)

func getDataDir() string {
	home, _ := os.UserHomeDir()
	dir := filepath.Join(home, ".cli-tool")
	os.MkdirAll(dir, 0755)
	return dir
}

func loadData() {
	dataFile = filepath.Join(getDataDir(), "notes.json")
	data, err := os.ReadFile(dataFile)
	if err != nil {
		notes = []Note{}
		return
	}
	json.Unmarshal(data, &notes)
}

func saveData() {
	data, _ := json.MarshalIndent(notes, "", "  ")
	os.WriteFile(dataFile, data, 0644)
}

func nextID() int {
	max := 0
	for _, n := range notes {
		if n.ID > max {
			max = n.ID
		}
	}
	return max + 1
}

var rootCmd = &cobra.Command{
	Use:   "notes",
	Short: "A simple CLI note-taking tool",
	Long:  "Take notes, manage todos, and stay organized from your terminal.",
}

var addCmd = &cobra.Command{
	Use:   "add <title>",
	Short: "Add a new note",
	Args:  cobra.MinimumNArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		loadData()
		content, _ := cmd.Flags().GetString("content")
		pinned, _ := cmd.Flags().GetBool("pin")

		note := Note{
			ID:        nextID(),
			Title:     args[0],
			Content:   content,
			CreatedAt: time.Now(),
			Pinned:    pinned,
		}
		notes = append(notes, note)
		saveData()

		green := color.New(color.FgGreen).SprintFunc()
		fmt.Printf("%s Note added: %s\n", green("✓"), note.Title)
	},
}

var listCmd = &cobra.Command{
	Use:   "list",
	Short: "List all notes",
	Run: func(cmd *cobra.Command, args []string) {
		loadData()
		if len(notes) == 0 {
			yellow := color.New(color.FgYellow).SprintFunc()
			fmt.Println(yellow("No notes yet. Use 'notes add <title>' to create one."))
			return
		}

		sort.Slice(notes, func(i, j int) bool {
			if notes[i].Pinned != notes[j].Pinned {
				return notes[i].Pinned
			}
			return notes[i].CreatedAt.After(notes[j].CreatedAt)
		})

		cyan := color.New(color.FgCyan).SprintFunc()
		bold := color.New(color.Bold).SprintFunc()
		gray := color.New(color.FgHiBlack).SprintFunc()

		fmt.Println(bold("Notes"))
		fmt.Println(gray("─"))

		for _, n := range notes {
			pin := ""
			if n.Pinned {
				pin = " " + cyan("📌")
			}
			fmt.Printf("  %s%d%s%s %s\n", cyan(""), n.ID, ". ", bold(n.Title), pin)
			if n.Content != "" {
				fmt.Printf("      %s\n", gray(n.Content))
			}
			fmt.Printf("      %s\n", gray(n.CreatedAt.Format("Jan 02, 15:04")))
		}
	},
}

var showCmd = &cobra.Command{
	Use:   "show <id>",
	Short: "Show a note's details",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		loadData()
		id, err := strconv.Atoi(args[0])
		if err != nil {
			red := color.New(color.FgRed).SprintFunc()
			fmt.Println(red("Invalid note ID"))
			return
		}

		for _, n := range notes {
			if n.ID == id {
				bold := color.New(color.Bold).SprintFunc()
				cyan := color.New(color.FgCyan).SprintFunc()
				gray := color.New(color.FgHiBlack).SprintFunc()

				fmt.Printf("\n%s %s\n", cyan(fmt.Sprintf("#%d", n.ID)), bold(n.Title))
				fmt.Println(gray("─"))
				if n.Content != "" {
					fmt.Printf("%s\n\n", n.Content)
				} else {
					fmt.Println(gray("(no content)\n"))
				}
				fmt.Printf("%s %s\n", gray("Created:"), n.CreatedAt.Format("Jan 02, 2006 15:04"))
				if n.Pinned {
					fmt.Println(cyan("📌 Pinned"))
				}
				return
			}
		}

		red := color.New(color.FgRed).SprintFunc()
		fmt.Println(red("Note not found"))
	},
}

var deleteCmd = &cobra.Command{
	Use:   "delete <id>",
	Short: "Delete a note",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		loadData()
		id, err := strconv.Atoi(args[0])
		if err != nil {
			red := color.New(color.FgRed).SprintFunc()
			fmt.Println(red("Invalid note ID"))
			return
		}

		for i, n := range notes {
			if n.ID == id {
				notes = append(notes[:i], notes[i+1:]...)
				saveData()
				green := color.New(color.FgGreen).SprintFunc()
				fmt.Printf("%s Deleted: %s\n", green("✓"), n.Title)
				return
			}
		}

		red := color.New(color.FgRed).SprintFunc()
		fmt.Println(red("Note not found"))
	},
}

var pinCmd = &cobra.Command{
	Use:   "pin <id>",
	Short: "Pin/unpin a note",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		loadData()
		id, err := strconv.Atoi(args[0])
		if err != nil {
			red := color.New(color.FgRed).SprintFunc()
			fmt.Println(red("Invalid note ID"))
			return
		}

		for i, n := range notes {
			if n.ID == id {
				notes[i].Pinned = !n.Pinned
				saveData()
				green := color.New(color.FgGreen).SprintFunc()
				state := "pinned"
				if !notes[i].Pinned {
					state = "unpinned"
				}
				fmt.Printf("%s Note %s: %s\n", green("✓"), state, n.Title)
				return
			}
		}

		red := color.New(color.FgRed).SprintFunc()
		fmt.Println(red("Note not found"))
	},
}

var versionCmd = &cobra.Command{
	Use:   "version",
	Short: "Print version info",
	Run: func(cmd *cobra.Command, args []string) {
		cyan := color.New(color.FgCyan).SprintFunc()
		fmt.Printf("notes v1.0.0\nBuilt with %s\n", cyan("Go"))
	},
}

func init() {
	addCmd.Flags().StringP("content", "c", "", "Note content")
	addCmd.Flags().BoolP("pin", "p", false, "Pin this note")

	rootCmd.AddCommand(addCmd)
	rootCmd.AddCommand(listCmd)
	rootCmd.AddCommand(showCmd)
	rootCmd.AddCommand(deleteCmd)
	rootCmd.AddCommand(pinCmd)
	rootCmd.AddCommand(versionCmd)
}

func Execute() error {
	return rootCmd.Execute()
}
