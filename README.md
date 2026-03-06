# Leet Code IDE Connector!

**Why use it?**
You want the full IDE experience whilst grinding LeetCode!

**How it works:**
- Load a LeetCode problem page and save the initial solution to the local `_live_code/solution.py`.
- When you edit the `_live_code/solution.py`, it pushes code to the code editor in the LeetCode window.
- When you (or your IDE) runs `scripts/ide_run/run_leet_test_cases`, LeetCode 
- Saves test results to a local `_live_code/tests_output.txt`

**Is this allowed?**
Probably? There is front end script injection, but absolutely no manipulation with the https requests between the client and server. This app is made to enhance the LeetCode experience. This app is not made for cheating or hacking in any way.

**Quick start:**
```bash
sh scripts/make   # build it

### Install
`sh scripts/make`

### Run
`sh scripts/start`

### Clean
`sh scripts/clean`
