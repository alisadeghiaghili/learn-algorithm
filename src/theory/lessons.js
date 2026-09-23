/**
 * Lesson packs for course depth (analysis, invariants, proofs).
 * Rendered into the side panel. Keep copy precise — exam-level, not marketing.
 */

export const lessons = {
  asymptotics: `
    <p><strong>Orders of growth.</strong> f(n) = O(g(n)) if ∃ c,n₀ &gt; 0: f(n) ≤ c·g(n) for n ≥ n₀.
    Ω is the lower-bound dual; Θ is both.</p>
    <p><strong>Why we drop constants:</strong> machine-independent ranking of growth. A 10n algorithm beats n² for large n even if the constant is large.</p>
    <p><strong>Asymptotic arithmetic.</strong> max(f,g) = Θ(f+g). If f = O(g) then f+g = Θ(g). Products multiply.</p>
    <p><strong>Common classes (tight order):</strong></p>
    <ul>
      <li>O(1) &lt; O(log n) &lt; O(n) &lt; O(n log n) &lt; O(n²) &lt; O(2ⁿ) &lt; O(n!)</li>
    </ul>
    <p><strong>Proof pattern for O:</strong> choose c and n₀, show inequality holds. For Ω use the lower bound. Never claim Θ from only one side.</p>
  `,

  recurrences: `
    <p><strong>Divide &amp; conquer recurrences.</strong> T(n) = a T(n/b) + f(n).</p>
    <p><strong>Master Theorem (CLRS form).</strong> Compare f(n) with n^{log_b a}:</p>
    <ol>
      <li>f = O(n^{log_b a − ε}) → T = Θ(n^{log_b a}) <em>(leaves dominate)</em></li>
      <li>f = Θ(n^{log_b a} log^k n) with k ≥ 0 → T = Θ(n^{log_b a} log^{k+1} n) <em>(balanced)</em></li>
      <li>f = Ω(n^{log_b a + ε}) and a f(n/b) ≤ c f(n) → T = Θ(f(n)) <em>(root dominates)</em></li>
    </ol>
    <p><strong>Worked examples.</strong></p>
    <ul>
      <li>Merge sort: 2T(n/2)+Θ(n) → a=2,b=2 → Θ(n log n) (case 2)</li>
      <li>Binary search: T(n/2)+Θ(1) → Θ(log n) (case 2)</li>
      <li>Karatsuba: 3T(n/2)+Θ(n) → Θ(n^{log₂3}) ≈ n^{1.585} (case 1)</li>
      <li>Naive matrix mult: 8T(n/2)+Θ(n²) → Θ(n³) (case 2)</li>
    </ul>
    <p><strong>Invariant for substitution:</strong> guess T(n) ≤ cn log n, prove by induction on n (assume all smaller).</p>
  `,

  sortingTheory: `
    <p><strong>Correctness invariant (insertion).</strong> After iteration i, a[0..i] is sorted and is a permutation of the original first i+1 elements.</p>
    <p><strong>Stability.</strong> Equal keys keep relative order. Insertion/merge (with ≤) are stable; selection/heap/quick (classic) are not.</p>
    <p><strong>In-place.</strong> O(1) extra memory: bubble, selection, insertion, heap, quick (Lomuto/Hoare). Merge sort needs Θ(n) unless in-place variants (hard, rare).</p>
    <p><strong>Lower bound.</strong> Any comparison sort is Ω(n log n) in the worst case (decision tree has n! leaves, height ≥ log n! = Θ(n log n) by Stirling).</p>
    <p><strong>When to use what.</strong></p>
    <ul>
      <li>nearly sorted → insertion O(n)</li>
      <li>need stable + guaranteed n log n → merge</li>
      <li>need in-place + fast average → quick</li>
      <li>need worst-case n log n + in-place → heap</li>
      <li>keys are integers in small range → counting O(n+k)</li>
    </ul>
  `,

  linearSorts: `
    <p><strong>Counting sort.</strong> Stable, O(n+k), k = key range. Counts, prefix sums, scatter into output right-to-left for stability.</p>
    <p><strong>Radix sort.</strong> LSD: counting sort per digit. O(d(n+k)). Beats comparison sorts when d = O(1) or d·(n+k) = O(n log n).</p>
    <p><strong>Bucket sort.</strong> Assumes uniform input in [0,1); expected O(n) with insertion in buckets.</p>
    <p><strong>Not comparison sorts</strong> — they dodge Ω(n log n) by using key structure.</p>
  `,

  searchingSelection: `
    <p><strong>Binary search invariant.</strong> If target exists, it lies in a[lo..hi]. Each step halves the range → O(log n).</p>
    <p><strong>Precondition:</strong> sorted non-decreasing. Without it, binary search is incorrect — not just slow.</p>
    <p><strong>Selection (k-th order statistic).</strong></p>
    <ul>
      <li>Sort + index: O(n log n)</li>
      <li>Randomized select: expected O(n)</li>
      <li>Median of Medians: worst-case O(n)</li>
    </ul>
    <p><strong>MOM idea.</strong> Pivot = median of medians of 5-element groups → guarantees ≥30% of elements on each side → recurrence T(n) = T(n/5) + T(7n/10) + O(n) = O(n).</p>
  `,

  dataStructures: `
    <p><strong>Stack / Queue.</strong> LIFO / FIFO. All ops O(1) amortized with dynamic array / ring buffer.</p>
    <p><strong>Binary heap.</strong> Array-backed complete binary tree: parent(i) = ⌊(i-1)/2⌋. Insert: sift-up O(log n). Extract: swap root with last, sift-down O(log n). Build-heap: O(n).</p>
    <p><strong>BST invariant.</strong> left keys &lt; node &lt; right keys. Search/insert/delete O(h). Unbalanced h = Θ(n); balanced h = Θ(log n).</p>
    <p><strong>AVL.</strong> Balance factor ∈ {−1,0,1}. Rotations restore invariants in O(1) local work; rebalance is O(log n) up the path.</p>
    <p><strong>Union-Find (DSU).</strong> Operations: FIND, UNION. With path compression + union by rank: inverse-Ackermann amortized O(α(n)) — nearly constant.</p>
    <p><strong>Hash table.</strong> h(k) → bucket. Load factor α = n/m. Chaining: expected O(1+α). Open addressing needs α &lt; 1 and careful deletion (tombstones).</p>
    <p><strong>Amortized analysis.</strong> Aggregate / accounting / potential. Dynamic array doubling: O(1) amortized per push despite occasional O(n).</p>
  `,

  graphsTheory: `
    <p><strong>Representation.</strong> Adjacency list O(V+E); matrix O(V²) — better for dense graphs and edge-existence queries.</p>
    <p><strong>BFS.</strong> Layers by distance in unweighted graphs. Queue. O(V+E). Tree edges = BFS tree; non-tree edges join same/adjacent layers.</p>
    <p><strong>DFS.</strong> Stack/recursion. Timestamps (discover/finish). Parenthesis theorem; white-path theorem. O(V+E).</p>
    <p><strong>Topological sort.</strong> Exists iff DAG. DFS reverse-postorder, or Kahn (indegrees + queue).</p>
    <p><strong>Strong components.</strong> Kosaraju: DFS order + DFS on Gᵀ. Or Tarjan/lowlinks. Condensation graph is a DAG.</p>
    <p><strong>Bipartite.</strong> 2-colorable iff no odd cycle (BFS coloring check).</p>
  `,

  shortestPaths: `
    <p><strong>BFS</strong> works only for unit weights.</p>
    <p><strong>Dijkstra.</strong> Non-negative weights. Invariant: when u is settled, dist[u] is final. Priority queue: O((V+E) log V). Fails on negative edges.</p>
    <p><strong>Bellman-Ford.</strong> Relax all edges V−1 times → correct even with negative weights (no neg cycle). One more pass detects negative cycles. O(V·E).</p>
    <p><strong>Floyd-Warshall.</strong> All-pairs. dp[k][i][j] = best path using intermediates in {1..k}. O(V³). Detects neg cycles on diagonal.</p>
    <p><strong>DAG shortest path.</strong> Topo order + relax. O(V+E).</p>
  `,

  mst: `
    <p><strong>Definition.</strong> Spanning tree of min total weight. Unique if all weights distinct.</p>
    <p><strong>Cut property.</strong> Lightest edge crossing any cut is in some MST.</p>
    <p><strong>Cycle property.</strong> Heaviest edge on a cycle is in no MST.</p>
    <p><strong>Kruskal.</strong> Sort edges; add if it joins components (DSU). O(E log E).</p>
    <p><strong>Prim.</strong> Grow one tree; always add cheapest outgoing edge (heap). O(E log V).</p>
  `,

  flow: `
    <p><strong>Flow network.</strong> Directed graph, capacities c(u,v) ≥ 0, source s, sink t.</p>
    <p><strong>Feasible flow.</strong> Capacity constraint + conservation at non-terminals. Value = net out of s.</p>
    <p><strong>Residual graph.</strong> Forward residual = c−f; backward residual = f (undo).</p>
    <p><strong>Ford-Fulkerson.</strong> Augment along any s-t path in residual while one exists.</p>
    <p><strong>Edmonds-Karp.</strong> BFS for shortest augmenting path → O(V E²).</p>
    <p><strong>Max-Flow Min-Cut.</strong> max value = min cut capacity. Certificate: residual has no s-t path; cut = vertices reachable from s in residual.</p>
  `,

  dpTheory: `
    <p><strong>DP checklist.</strong></p>
    <ol>
      <li><strong>Subproblems:</strong> a finite set of states (often prefixes/intervals/pairs)</li>
      <li><strong>Guess:</strong> a small number of choices at each state</li>
      <li><strong>Recurrence:</strong> dp[state] = cost + extremum of dp[next]</li>
      <li><strong>Topo order:</strong> reverse of dependencies</li>
      <li><strong>Answer:</strong> usually dp[full] or max over states</li>
    </ol>
    <p><strong>Correctness.</strong> Induction on state measure (length, capacity, index).</p>
    <p><strong>Analysis.</strong> O(#states × #choices × transition).</p>
    <p><strong>Classic shapes.</strong></p>
    <ul>
      <li>1D (fib, coin change, rod cutting)</li>
      <li>2D prefix pair (LCS, edit distance)</li>
      <li>interval (matrix chain, optimal BST)</li>
      <li>knapsack / subset sum</li>
    </ul>
  `,

  greedy: `
    <p><strong>Greedy choice + optimal substructure</strong> is not enough — you need a proof the local choice stays optimal.</p>
    <p><strong>Exchange argument.</strong> Take any optimal solution; exchange a piece with the greedy choice without making it worse.</p>
    <p><strong>Activity selection.</strong> Sort by finish time; always take the earliest finishing compatible activity. Exchange proof. O(n log n).</p>
    <p><strong>Huffman.</strong> Merge two lightest nodes repeatedly. Prefix-free codes with min weighted path length. O(n log n).</p>
    <p><strong>Fractional knapsack:</strong> greedy by value density is optimal. <strong>0/1 is not</strong> (counterexample easy).</p>
    <p><strong>Matroids.</strong> Independence systems where greedy is optimal iff the system is a matroid (hereditary + exchange).</p>
  `,

  divideConquer: `
    <p><strong>Template.</strong> Divide (balanced ideally), conquer recursively, combine in linear or subquadratic work.</p>
    <p><strong>Closest pair of points.</strong> Sort by x; recurse on halves; strip of width 2δ needs only 7 neighbors checked → T(n)=2T(n/2)+O(n) = O(n log n).</p>
    <p><strong>Karatsuba.</strong> 3 mults instead of 4 on halves. Θ(n^{log₂3}).</p>
    <p><strong>FFT / polynomial mult.</strong> n log n over ℂ or finite fields; enables integer mult in n log n and convolution problems.</p>
  `,

  strings: `
    <p><strong>Naive matching.</strong> O(nm) worst case.</p>
    <p><strong>KMP.</strong> Failure function (LPS/π). On mismatch, shift pattern using longest proper prefix-suffix. O(n+m).</p>
    <p><strong>Rabin-Karp.</strong> Rolling hash O(1) update. Expected O(n+m); worst O(nm) with many spurious hits. Use two mods or 64-bit to cut collisions.</p>
    <p><strong>Suffix arrays / trees.</strong> All pattern queries: find all occurrences of P in T in O(|P| log |T|) or O(|P|) with LCP. Building SA is O(n log n) or O(n).</p>
  `,

  np: `
    <p><strong>P.</strong> Decision problems solvable in poly time.</p>
    <p><strong>NP.</strong> Yes-instances have poly-size certificates verifiable in poly time.</p>
    <p><strong>NP-hard.</strong> Every problem in NP reduces to it (or at least as hard as NP).</p>
    <p><strong>NP-complete.</strong> In NP and NP-hard.</p>
    <p><strong>Reduction A ≤_p B.</strong> Poly-time f maps instances of A to B with x ∈ A ⇔ f(x) ∈ B. Transfers hardness. Typically: take arbitrary A-instance, <em>construct</em> B-instance, prove equivalence.</p>
    <p><strong>Canonical chain.</strong> SAT ≤ 3-SAT ≤ CLIQUE ≤ VERTEX-COVER ≤ HAM-CYCLE ≤ TSP. Cook-Levin: SAT is NP-complete.</p>
    <p><strong>Attack pattern on a new hard problem.</strong> Try to reduce a known NPC problem to it (not the other way around).</p>
  `,

  randomized: `
    <p><strong>Las Vegas.</strong> Always correct; expected poly time (randomized quicksort, randomized select).</p>
    <p><strong>Monte Carlo.</strong> Poly time always; error probability (Fermat primality, Freivalds matrix mult verification).</p>
    <p><strong>Expectation linearity.</strong> E[X+Y]=E[X]+E[Y] even when dependent — the workhorse of randomized analysis.</p>
    <p><strong>Concentration.</strong> Chernoff bounds for sums of independent 0/1 rvs.</p>
    <p><strong>Approximation.</strong> NP-hardness means drop exactness: e.g. greedy ½-approx for max vertex cover variants, PTAS for knapsack.</p>
  `,
};

/**
 * Quiz banks for analysis drills. Each item: prompt, choices, answer, why.
 */
export const analysisQuizzes = {
  asymptotics: [
    {
      id: 'asym-1',
      prompt: '3n² + n log n + 5 is …',
      choices: { a: 'O(n)', b: 'O(n²)', c: 'O(n² log n)', d: 'O(n³)' },
      answer: 'b',
      why: 'Highest degree term is Θ(n²); lower terms and constants drop.',
    },
    {
      id: 'asym-2',
      prompt: 'log(n!) is …',
      choices: { a: 'Θ(log n)', b: 'Θ(n)', c: 'Θ(n log n)', d: 'Θ(n²)' },
      answer: 'c',
      why: 'Stirling: log n! = Θ(n log n). This is the comparison-sort lower bound.',
    },
    {
      id: 'asym-3',
      prompt: 'If f(n)=O(g(n)) and g(n)=O(h(n)) then f(n)=…',
      choices: { a: 'O(h(n))', b: 'Ω(h(n))', c: 'Θ(h(n))', d: 'not related' },
      answer: 'a',
      why: 'Big-O is transitive.',
    },
  ],
  recurrences: [
    {
      id: 'rec-1',
      prompt: 'T(n) = 4T(n/2) + Θ(n) → ?',
      choices: { a: 'Θ(n)', b: 'Θ(n log n)', c: 'Θ(n²)', d: 'Θ(n² log n)' },
      answer: 'c',
      why: 'a=4,b=2 → n^{log_b a}=n². f=n is smaller → case 1: Θ(n²).',
    },
    {
      id: 'rec-2',
      prompt: 'T(n) = 2T(n/2) + Θ(n log n) → ?',
      choices: { a: 'Θ(n log n)', b: 'Θ(n (log n)²)', c: 'Θ(n²)', d: 'Θ(n)' },
      answer: 'b',
      why: 'Case 2 with k=1: Θ(n^{log₂2} log^{2} n) = Θ(n (log n)²).',
    },
    {
      id: 'rec-3',
      prompt: 'T(n) = T(n/2) + Θ(1) → ?',
      choices: { a: 'Θ(1)', b: 'Θ(log n)', c: 'Θ(n)', d: 'Θ(n log n)' },
      answer: 'b',
      why: 'Binary search recurrence.',
    },
    {
      id: 'rec-4',
      prompt: 'T(n) = 3T(n/2) + Θ(n) → ?',
      choices: { a: 'Θ(n)', b: 'Θ(n^{log₂3})', c: 'Θ(n²)', d: 'Θ(n log n)' },
      answer: 'b',
      why: 'Karatsuba shape. Case 1 since n &lt; n^{1.585}.',
    },
  ],
  sorting: [
    {
      id: 'sort-1',
      prompt: 'Worst-case time of quicksort (Lomuto, last pivot)?',
      choices: { a: 'Θ(n log n)', b: 'Θ(n²)', c: 'Θ(n)', d: 'Θ(log n)' },
      answer: 'b',
      why: 'Already-sorted input with last pivot always makes unbalanced partitions.',
    },
    {
      id: 'sort-2',
      prompt: 'Which comparison sort is stable and Θ(n log n) worst-case?',
      choices: { a: 'heapsort', b: 'quicksort', c: 'mergesort', d: 'selection sort' },
      answer: 'c',
      why: 'Mergesort with ≤ is stable and always n log n.',
    },
    {
      id: 'sort-3',
      prompt: 'Comparison sorting lower bound in the worst case?',
      choices: { a: 'Ω(n)', b: 'Ω(n log n)', c: 'Ω(n²)', d: 'Ω(log n)' },
      answer: 'b',
      why: 'Decision tree argument with n! leaves.',
    },
    {
      id: 'sort-4',
      prompt: 'Counting sort complexity (n elements, key range 0..k)?',
      choices: { a: 'O(n log n)', b: 'O(n + k)', c: 'O(nk)', d: 'O(k log k)' },
      answer: 'b',
      why: 'Counting + prefix + scatter. Not a comparison sort.',
    },
  ],
  ds: [
    {
      id: 'ds-1',
      prompt: 'Binary heap insert worst-case?',
      choices: { a: 'O(1)', b: 'O(log n)', c: 'O(n)', d: 'O(n log n)' },
      answer: 'b',
      why: 'Sift-up walks at most one root-to-leaf path.',
    },
    {
      id: 'ds-2',
      prompt: 'Union-Find with path compression + union by rank amortized time?',
      choices: { a: 'O(1)', b: 'O(log n)', c: 'O(α(n))', d: 'O(n)' },
      answer: 'c',
      why: 'Inverse Ackermann — effectively constant but not literally O(1).',
    },
    {
      id: 'ds-3',
      prompt: 'Unbalanced BST worst-case search?',
      choices: { a: 'O(log n)', b: 'O(n)', c: 'O(n log n)', d: 'O(1)' },
      answer: 'b',
      why: 'Degrades to a linked list.',
    },
    {
      id: 'ds-4',
      prompt: 'Build a binary heap from n elements?',
      choices: { a: 'O(n log n)', b: 'O(n)', c: 'O(n²)', d: 'O(log n)' },
      answer: 'b',
      why: 'Floyd’s build-heap: sum of sift-downs is linear.',
    },
  ],
  graphs: [
    {
      id: 'g-1',
      prompt: 'BFS time on adjacency list?',
      choices: { a: 'O(V²)', b: 'O(V+E)', c: 'O(E log V)', d: 'O((V+E)log V)' },
      answer: 'b',
      why: 'Each vertex enqueued once, each edge examined constantly often.',
    },
    {
      id: 'g-2',
      prompt: 'Dijkstra with binary heap?',
      choices: { a: 'O(V+E)', b: 'O((V+E) log V)', c: 'O(V²)', d: 'O(VE)' },
      answer: 'b',
      why: 'Each extract-min / decrease-key is O(log V).',
    },
    {
      id: 'g-3',
      prompt: 'Graph has negative-weight edges. Correct shortest-path algo?',
      choices: { a: 'Dijkstra', b: 'BFS', c: 'Bellman-Ford', d: 'Prim' },
      answer: 'c',
      why: 'Dijkstra’s settle-once invariant breaks with negatives.',
    },
    {
      id: 'g-4',
      prompt: 'Number of strong components found after topo-sorting the condensation?',
      choices: { a: 'not a DAG', b: '1 always', c: 'a DAG with one node per SCC', d: '2' },
      answer: 'c',
      why: 'Contracting SCCs always yields a DAG.',
    },
  ],
  dp: [
    {
      id: 'dp-1',
      prompt: 'LCS of strings length m, n — time of the classic DP?',
      choices: { a: 'O(m+n)', b: 'O(mn)', c: 'O(mn log mn)', d: 'O(2^{m+n})' },
      answer: 'b',
      why: 'One cell per pair (i,j), O(1) work each.',
    },
    {
      id: 'dp-2',
      prompt: '0/1 knapsack with capacity W and n items (pseudo-poly)?',
      choices: { a: 'O(n)', b: 'O(nW)', c: 'O(2ⁿ)', d: 'O(W log W)' },
      answer: 'b',
      why: 'Pseudo-polynomial: polynomial in the numeric value W, not bit-length.',
    },
    {
      id: 'dp-3',
      prompt: 'Coin change (min #coins, unlimited) optimal substructure is…',
      choices: {
        a: 'dp[x] = 1 + min_c dp[x−c]',
        b: 'sort coins and take largest',
        c: 'dp[x] = dp[x−1]',
        d: 'greedy by coin value',
      },
      answer: 'a',
      why: 'Greedy by largest coin fails for {1,3,4} amount 6 (greedy 4+1+1=3, optimal 3+3=2).',
    },
  ],
  greedy: [
    {
      id: 'gr-1',
      prompt: 'Activity selection greedy rule?',
      choices: {
        a: 'earliest start',
        b: 'earliest finish',
        c: 'shortest duration',
        d: 'most conflicts',
      },
      answer: 'b',
      why: 'Earliest finish leaves maximal room — exchange argument.',
    },
    {
      id: 'gr-2',
      prompt: 'Fractional knapsack is greedy-optimal via…',
      choices: {
        a: 'value/weight density sort',
        b: 'weight sort',
        c: 'value sort',
        d: 'random',
      },
      answer: 'a',
      why: '0/1 knapsack is NP-hard — fractionality is essential.',
    },
    {
      id: 'gr-3',
      prompt: 'Huffman tree cost equals…',
      choices: {
        a: 'sum of depths',
        b: 'weighted external path length',
        c: 'number of leaves',
        d: 'height',
      },
      answer: 'b',
      why: 'Minimizes Σ freq(c) · depth(c) among prefix codes.',
    },
  ],
  np: [
    {
      id: 'np-1',
      prompt: 'To show B is NP-hard you typically…',
      choices: {
        a: 'reduce B to SAT',
        b: 'reduce a known NPC problem A to B',
        c: 'write a brute-force for B',
        d: 'prove B ∈ NP',
      },
      answer: 'b',
      why: 'A ≤_p B transfers hardness downward to B.',
    },
    {
      id: 'np-2',
      prompt: 'CLIQUEnpc proof uses reduction from…',
      choices: { a: 'PATH', b: '3-SAT', c: 'MST', d: 'SORT' },
      answer: 'b',
      why: 'Classic 3-SAT → CLIQUE construction (groups per clause).',
    },
    {
      id: 'np-3',
      prompt: 'If P = NP then…',
      choices: {
        a: 'nothing changes',
        b: 'all NP problems have poly algorithms',
        c: 'SAT is unsolvable',
        d: 'BFS gets faster',
      },
      answer: 'b',
      why: 'Collapse of the hierarchy. Widely believed false.',
    },
  ],
  flow: [
    {
      id: 'fl-1',
      prompt: 'Edmonds-Karp worst-case time?',
      choices: { a: 'O(E)', b: 'O(VE)', c: 'O(V E²)', d: 'O(V²)' },
      answer: 'c',
      why: 'BFS augmenting paths are short; at most O(VE) augmentations of length O(V).',
    },
    {
      id: 'fl-2',
      prompt: 'Max-flow value equals…',
      choices: {
        a: 'sum of all capacities',
        b: 'min cut capacity',
        c: 'number of edges',
        d: 'max edge capacity',
      },
      answer: 'b',
      why: 'Max-flow min-cut theorem.',
    },
  ],
};
