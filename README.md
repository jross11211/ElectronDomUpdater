# LeetCode IDE Connector

**Why use it?**
You want the full IDE experience whilst grinding LeetCode — use your own editor, keybindings, extensions, and tools instead of the browser editor.

**How it works:**
- Loads a LeetCode problem page and saves the starter code to `_live_code/solution.py`.
- When you edit `_live_code/solution.py`, it pushes your code into the LeetCode editor automatically.
- When your IDE runs `scripts/ide_run/run_leet_test_cases`, a trigger file is created that causes the run button to be clicked on your next save.
- Test results are written to `_live_code/tests_output.txt` after each run.

**Is this allowed?**
This is a personal developer productivity tool, not a cheating aid. It does not solve problems, generate answers, or automate any decision-making. All it does is sync code you write in your own editor into the LeetCode browser editor, and write test results back to a local file — the same actions you would take manually.

Under the hood, it uses client-side script injection (similar in nature to a browser extension) and passively reads network responses from requests that you initiate yourself. It does not manipulate, spoof, or replay any requests to LeetCode's servers.

That said, I can't guarantee it complies with LeetCode's Terms of Service in all situations or forever. If you're unsure, review their ToS before use.

### Install
```bash
sh scripts/make
```

### Run
```bash
sh scripts/start
```

### Clean
```bash
sh scripts/clean
```
