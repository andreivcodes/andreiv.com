---
title: "DA Application"
date: "2025-1-20"
description: "Application for Arbitrum DAO Domain Allocator Offerings Grant Program"
---

# I'm Andrei

<div style="display: flex; align-items: center; gap: 40px; padding: 20px;">
  <img
    src="/profile.jpeg"
    alt="Profile Picture"
    style="width: 250px; height: 250px; border-radius: 50%; object-fit: cover; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);"
  />
  <div style="display: flex; flex-direction: column; gap: 10px; font-size: 1.2rem; line-height: 1.6; text-align: left;">
    <p>I'm a <strong>developer</strong></p>
    <p>...who has <strong>coded</strong> trains</p>
    <p>...who has <strong>coded</strong> cars</p>
    <p>...who has <strong>coded</strong> <a href="https://x.com/SenateLabs" target="_blank" style="color: #F8B229; text-decoration: none;">@SenateLabs</a></p>
    <p>...who is <strong>coding</strong> <a href="https://proposals.app" target="_blank" style="color: #F8B229; text-decoration: none;">proposals.app</a></p>
    <p>...who is <strong>applying</strong> for <u>Dev Tooling on One and Stylus DA</u></p>
  </div>
</div>

---

# more about me

For more details about my background, check out my application:

[Domain Allocator Application](https://forum.arbitrum.foundation/t/election-application-thread-arbitrum-d-a-o-domain-allocator-offerings-grant-program/27909/21?u=andreiv)


---

# why I'm applying

<div style="font-size: 1.2rem; line-height: 1.6; text-align: left;">
  <p>As any developer, I'm very <strong>opinionated</strong>.</p>
  <p>I believe good <strong>UX</strong> is enabled through even better <strong>DX</strong> — I talked about it <a href="https://x.com/andreivtweets/status/1788643176195989861">here</a>.</p>
  <p>I believe bad tooling can <strong>kill</strong> an ecosystem. Good tooling can ignite <strong>passion<strong/>.</p>
</div>

---

<div style="display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 20px;">
  <div style="display: flex; justify-content: space-between; width: 100%; max-width: 1000px; gap: 40px;">
    <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
      <h2>There is a time for ...</h2>
      <img
        src="/slides/da_application/salt-bae.webp"
        alt="Salt Bae"
        style="width: 100%; max-width: 400px; height: auto; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);"
      />
    </div>
    <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
      <h2>...and a time for</h2>
      <img
        src="/slides/da_application/olimpic-shooter.jpg"
        alt="Olympic Shooter"
        style="width: 100%; max-width: 400px; height: auto; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);"
      />
    </div>
  </div>
</div>

---

<div style="max-width: 600px; margin: auto; padding: 20px;">
  <h1 style="font-size: 2.5rem; font-weight: bold; text-align: center; margin-bottom: 20px;">devs are weird</h1>
  <div style="font-size: 1.2rem; line-height: 1.6; text-align: left;">
    <p>they hold <strong>strong feelings</strong> about their tools.</p>
    <p>they crave <strong>clarity</strong>.</p>
    <p>once burned, they will hold a grudge.</p>
  </div>
</div>

---

<div style="max-width: 800px; margin: auto; padding: 20px;">
  <h1 style="font-size: 2.5rem; font-weight: bold; text-align: center; margin-bottom: 40px;">not do's</h1>
  <div style="font-size: 1.2rem; line-height: 1.6; text-align: left;">
    <p><strong>fragmentation</strong> — multiple SDKs for the same thing, none of them great.</p>
    <p><strong>product-like tools</strong> — APIs with closed-source backends, no thanks.</p>
  </div>
</div>

---

<div style="max-width: 800px; margin: auto; padding: 20px;">
  <h1 style="font-size: 2.5rem; font-weight: bold; text-align: center; margin-bottom: 40px;">do's</h1>
  <div style="font-size: 1.2rem; line-height: 1.6; text-align: left;">
    <p><strong>value composability</strong> — play nice with existing standards.</p>
    <p><strong>value clarity</strong> — good docs, examples that work.</p>
    <p><strong>prioritize local-first</strong> — CLI tools, libraries, not just SaaS.</p>
    <p><strong>open source is non negotiable</strong> — no black boxes.</p>
  </div>
</div>

---

<div style="max-width: 800px; margin: auto; padding: 20px;">
  <h1 style="font-size: 2.5rem; font-weight: bold; text-align: center; margin-bottom: 40px;">what good dev tooling looks like</h1>
  <div style="font-size: 1.2rem; line-height: 1.6; text-align: left;">
    <pre>
        curl -s "https://jsonplaceholder.typicode.com/posts" | jq 'map(select(.userId == 1)) | .[0:5] | .[].title
    </pre>
    <p style="font-size: 1rem; margin-bottom: 20px; text-align: center;">
         <span style="font-weight: bold;">Workflow:</span>
         fetches data → filters user → selects first 5 posts → extracts title
       </p>
    <img
      src="/slides/da_application/cli-example.png"
      alt="Alpaca Output"
      style="width: 100%; max-width: 800px; height: auto;"
    />
  </div>
</div>

---

<div style="margin: auto; padding: 20px; width: 100%; max-width: 1200px;">
  <h1 style="font-size: 2.5rem; font-weight: bold; text-align: center; margin-bottom: 40px;">less extreme examples</h1>
  <div style="width: 100%; max-width: 1200px;display: flex; flex-direction: row; gap: 40px; align-items: center; justify-content: space-between;">
    <div style="text-align: center; flex: 1; align-self:start;">
      <p style="font-size: 1.2rem; font-weight: bold; margin-bottom: 10px;">clerk.com</p>
      <p style="font-size: 1rem; margin-bottom: 6px;">amazing dx</p>
      <p style="font-size: 1rem; margin-bottom: 6px;">not open :(</p>
      <img
        src="/slides/da_application/clerk-sign-in.webp"
        alt="Clerk Sign-In"
        style="width: 100%; min-width: 250px; height: auto; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);"
      />
    </div>
    <div style="text-align: center; flex: 1; align-self:start;">
      <p style="font-size: 1.2rem; font-weight: bold; margin-bottom: 10px;">posthog.com</p>
      <p style="font-size: 1rem; margin-bottom: 6px;">easy to integrate</p>
      <p style="font-size: 1rem; margin-bottom: 6px;">mostly open</p>
      <img
        src="/slides/da_application/posthog.png"
        alt="PostHog Analytics"
        style="width: 100%; min-width: 400px; height: auto; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);"
      />
    </div>
    <div style="text-align: center; flex: 1; align-self:start;">
      <p style="font-size: 1.2rem; font-weight: bold; margin-bottom: 10px;">onchainkit.xyz</p>
      <p style="font-size: 1rem; margin-bottom: 6px;">easy to integrate</p>
      <p style="font-size: 1rem; margin-bottom: 6px;">closed backend :(</p>
      <img
        src="/slides/da_application/onchainkit.png"
        alt="OnchainKit Interface"
        style="width: 100%; min-width: 250px; height: auto; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);"
      />
    </div>
  </div>
</div>

---

<div style="max-width: 600px; margin: auto; padding: 20px;">
  <h1 style="font-size: 2.5rem; font-weight: bold; text-align: center; margin-bottom: 40px;">the DA's true role</h1>
  <div style="font-size: 1.2rem; line-height: 1.6; text-align: left;">
    <p>it's <strong>more than due diligence work</strong>.</p>
    <p>identify and support tools that become <strong>ecosystem standards</strong>.</p>
    <p>have the courage to <strong>say no</strong> when necessary.</p>
  </div>
</div>

---

<div style="max-width: 600px; margin: auto; padding: 20px;">
  <h1 style="font-size: 2.5rem; font-weight: bold; text-align: center; margin-bottom: 20px;">Thank you!</h1>
  <div style="font-size: 1.2rem; line-height: 1.6; text-align: left;">
    <p>feel free to reach out to me via DMs:</p>
    <p><strong>web:</strong> <a href="https://andreiv.com/" target="_blank" style="color: #F8B229; text-decoration: none;">Andrei Voinea</a></p>
    <p><strong>telegram:</strong> <a href="https://t.me/andreiveth" target="_blank" style="color: #F8B229; text-decoration: none;">@andreiveth</a></p>
    <p><strong>x:</strong> <a href="https://x.com/andreivtweets" target="_blank" style="color: #F8B229; text-decoration: none;">@andreivtweets</a></p>
    <p><strong>github:</strong> <a href="https://github.com/andreivcodes" target="_blank" style="color: #F8B229; text-decoration: none;">@andreivcodes</a></p>
    <p><strong>applied for:</strong> Dev Tooling on One and Stylus</p>
  </div>
</div>
