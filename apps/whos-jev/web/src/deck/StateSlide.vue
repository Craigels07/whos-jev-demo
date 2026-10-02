<template>
  <section class="slide">
    <h1>State</h1>
    <p class="lead">State is the content the model evaluates. It goes in the <code>state</code> field, next to the questions.</p>
    <ul class="points">
      <li>It can be a <mark class="key">string, or a JSON object or array</mark> with context, examples and related records.</li>
      <li>Every question in a request <mark class="key">sees the same state</mark> and is evaluated independently.</li>
      <li>Put content and supporting facts in state. <mark class="key">Put the judgment in the question.</mark></li>
    </ul>
    <p class="example-label">Example request: the state</p>
    <pre class="example request-example">{
  "model": "jev-latest",
  "state": <span class="part state">{
    "message": "Please refund my duplicate charge.",
    "order": { "id": "A-1042", "total": 42.50 }
  }</span>,
  "questions": { <span class="val-muted">the next slide</span> }
}</pre>
    <p class="state-note">The docs recommend an object for most requests, because named fields keep relationships clear.</p>
    <footer class="sources">
      Source: <a href="https://docs.typesafe.ai/concepts/state.md">State</a>
    </footer>
  </section>
</template>
