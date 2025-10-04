const Discord = require('discord.js');
const ee = require('../../config/embed.json');

module.exports = {
    name: 'algorithm',
    description: 'Get algorithm solutions and explanations for common problems.',
    options: [
        {
            name: 'problem',
            description: 'Algorithm problem type',
            required: true,
            type: 3,
            choices: [
                { name: 'Sorting', value: 'sorting' },
                { name: 'Binary Search', value: 'binary-search' },
                { name: 'Fibonacci', value: 'fibonacci' },
                { name: 'Factorial', value: 'factorial' },
                { name: 'Palindrome', value: 'palindrome' },
                { name: 'Two Sum', value: 'two-sum' },
                { name: 'Reverse String', value: 'reverse-string' },
                { name: 'Find Maximum', value: 'find-maximum' }
            ]
        }
    ],
    usage: '/algorithm <problem>',
    execute(interaction) {
        const problem = interaction.options.getString('problem');
        
        const algorithms = {
            sorting: {
                title: '🔢 Sorting Algorithms',
                description: 'Different approaches to sort arrays/lists',
                solution: '```python\n# Bubble Sort\ndef bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n-i-1):\n            if arr[j] > arr[j+1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]\n    return arr\n\n# Quick Sort\ndef quick_sort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quick_sort(left) + middle + quick_sort(right)\n```',
                complexity: 'Bubble Sort: O(n²), Quick Sort: O(n log n) average'
            },
            'binary-search': {
                title: '🎯 Binary Search',
                description: 'Efficiently find elements in sorted arrays',
                solution: '```python\ndef binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    \n    while left <= right:\n        mid = (left + right) // 2\n        \n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    \n    return -1  # Not found\n\n# Usage\narr = [1, 3, 5, 7, 9, 11]\nresult = binary_search(arr, 7)  # Returns 3\n```',
                complexity: 'Time: O(log n), Space: O(1)'
            },
            fibonacci: {
                title: '🌀 Fibonacci Sequence',
                description: 'Generate Fibonacci numbers efficiently',
                solution: '```python\n# Recursive (inefficient)\ndef fib_recursive(n):\n    if n <= 1:\n        return n\n    return fib_recursive(n-1) + fib_recursive(n-2)\n\n# Iterative (efficient)\ndef fib_iterative(n):\n    if n <= 1:\n        return n\n    a, b = 0, 1\n    for _ in range(2, n + 1):\n        a, b = b, a + b\n    return b\n\n# Memoized (efficient for multiple calls)\ndef fib_memo(n, memo={}):\n    if n in memo:\n        return memo[n]\n    if n <= 1:\n        return n\n    memo[n] = fib_memo(n-1, memo) + fib_memo(n-2, memo)\n    return memo[n]\n```',
                complexity: 'Recursive: O(2ⁿ), Iterative: O(n), Memoized: O(n)'
            },
            factorial: {
                title: '❗ Factorial Calculation',
                description: 'Calculate factorial of a number',
                solution: '```python\n# Recursive\ndef factorial_recursive(n):\n    if n <= 1:\n        return 1\n    return n * factorial_recursive(n - 1)\n\n# Iterative\ndef factorial_iterative(n):\n    result = 1\n    for i in range(1, n + 1):\n        result *= i\n    return result\n\n# Using math library\nimport math\ndef factorial_builtin(n):\n    return math.factorial(n)\n\n# Usage\nprint(factorial_iterative(5))  # Output: 120\n```',
                complexity: 'Time: O(n), Space: O(1) iterative, O(n) recursive'
            },
            palindrome: {
                title: '🔄 Palindrome Check',
                description: 'Check if a string reads the same forwards and backwards',
                solution: '```python\n# Simple approach\ndef is_palindrome_simple(s):\n    return s == s[::-1]\n\n# Two-pointer approach\ndef is_palindrome_two_pointer(s):\n    left, right = 0, len(s) - 1\n    while left < right:\n        if s[left] != s[right]:\n            return False\n        left += 1\n        right -= 1\n    return True\n\n# Ignore case and non-alphanumeric\ndef is_palindrome_clean(s):\n    cleaned = \'\'.join(c.lower() for c in s if c.isalnum())\n    return cleaned == cleaned[::-1]\n\n# Usage\nprint(is_palindrome_simple("racecar"))  # True\nprint(is_palindrome_clean("A man, a plan, a canal: Panama"))  # True\n```',
                complexity: 'Time: O(n), Space: O(1) for two-pointer'
            },
            'two-sum': {
                title: '➕ Two Sum Problem',
                description: 'Find two numbers in array that add up to target',
                solution: '```python\n# Brute force approach\ndef two_sum_brute(nums, target):\n    for i in range(len(nums)):\n        for j in range(i + 1, len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i, j]\n    return []\n\n# Hash map approach (optimal)\ndef two_sum_hash(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []\n\n# Usage\nnums = [2, 7, 11, 15]\ntarget = 9\nresult = two_sum_hash(nums, target)  # Returns [0, 1]\n```',
                complexity: 'Brute force: O(n²), Hash map: O(n)'
            },
            'reverse-string': {
                title: '🔄 Reverse String',
                description: 'Reverse a string using different methods',
                solution: '```python\n# Using slicing (Pythonic)\ndef reverse_slice(s):\n    return s[::-1]\n\n# Using built-in reversed()\ndef reverse_builtin(s):\n    return \'\'.join(reversed(s))\n\n# Two-pointer approach (in-place for lists)\ndef reverse_two_pointer(s):\n    s_list = list(s)\n    left, right = 0, len(s_list) - 1\n    while left < right:\n        s_list[left], s_list[right] = s_list[right], s_list[left]\n        left += 1\n        right -= 1\n    return \'\'.join(s_list)\n\n# Recursive approach\ndef reverse_recursive(s):\n    if len(s) <= 1:\n        return s\n    return s[-1] + reverse_recursive(s[:-1])\n\n# Usage\nprint(reverse_slice("hello"))  # "olleh"\n```',
                complexity: 'Slicing: O(n), Two-pointer: O(n), Recursive: O(n)'
            },
            'find-maximum': {
                title: '📈 Find Maximum Element',
                description: 'Find the largest element in an array',
                solution: '```python\n# Using built-in max()\ndef find_max_builtin(arr):\n    return max(arr)\n\n# Linear search\ndef find_max_linear(arr):\n    if not arr:\n        return None\n    max_val = arr[0]\n    for num in arr[1:]:\n        if num > max_val:\n            max_val = num\n    return max_val\n\n# Using reduce\nfrom functools import reduce\ndef find_max_reduce(arr):\n    return reduce(lambda x, y: x if x > y else y, arr)\n\n# Find max with index\ndef find_max_with_index(arr):\n    if not arr:\n        return None, -1\n    max_val = arr[0]\n    max_idx = 0\n    for i, num in enumerate(arr[1:], 1):\n        if num > max_val:\n            max_val = num\n            max_idx = i\n    return max_val, max_idx\n\n# Usage\narr = [3, 1, 4, 1, 5, 9, 2, 6]\nprint(find_max_linear(arr))  # 9\n```',
                complexity: 'Time: O(n), Space: O(1)'
            }
        };

        const algo = algorithms[problem];
        if (!algo) {
            return interaction.reply({ content: 'Algorithm not found!', ephemeral: true });
        }

        const embed = new Discord.EmbedBuilder()
            .setColor(0x008080)
            .setTitle(algo.title)
            .setDescription(algo.description)
            .addFields(
                {
                    name: '💻 Implementation',
                    value: algo.solution,
                    inline: false
                },
                {
                    name: '⏱️ Time & Space Complexity',
                    value: algo.complexity,
                    inline: false
                },
                {
                    name: '💡 Key Points',
                    value: '• Understand the problem requirements\n• Consider edge cases (empty arrays, single elements)\n• Think about time vs space trade-offs\n• Test with different input sizes\n• Consider if the input is sorted or unsorted',
                    inline: false
                }
            )
            .setFooter({ text: ee.footertext, iconURL: ee.footericon });

        interaction.reply({ embeds: [embed] });
    }
};
