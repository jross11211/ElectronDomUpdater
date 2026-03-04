export interface TestResult {
    testIndex: number;
    passed: boolean;
    answer: string;
    expectedAnswer: string;
    stdout: string;
    expectedStdout: string;
    lang: string;
    statusRuntime: string;
    statusMemory: string;
    statusMsg: string;
}

export default function parseTestResults(response: any): TestResult[] {
    const body = response.response?.body ?? response;
    const count = body.total_testcases ?? 0;
    const results: TestResult[] = [];

    for (let i = 0; i < count; i++) {
        results.push({
            testIndex: i,
            passed: body.compare_result?.[i] === '1',
            answer: body.code_answer?.[i] ?? '',
            expectedAnswer: body.expected_code_answer?.[i] ?? '',
            stdout: body.std_output_list?.[i] ?? '',
            expectedStdout: body.expected_std_output_list?.[i] ?? '',
            lang: body.pretty_lang ?? body.lang ?? '',
            statusRuntime: body.status_runtime ?? '',
            statusMemory: body.status_memory ?? '',
            statusMsg: body.status_msg ?? '',
        });
    }

    return results;
}
