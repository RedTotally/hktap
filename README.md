<img src="https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/003/774/908/datas/original.png">

## The Chosen Theme
Smart Tourism – Enhance travel experiences and industry efficiency

## The Main Purposes
- We want to help travellers find and share their desired destinations.
- We want it to be fun and engaging to attract users.
- We want it to be convenient.

## Our Initiatives
The search results for destinations are usually too broad, unreliable, and dull. Imagine when you raised a single question, "I want to find an inexpensive restaurant in Mong Kok.", and you have to go through hundreds of search results or articles with biases, advertisements, and uncategorized information that are often posed by a cold algorithm or companies. It is time-consuming and confusing. We want to make a platform with warmth, based on real people, with fun, kindness, and practical guidance, that outlines exceptional sites for the users. We want to heat things up, let the users leverage their travel experience, and make information straightforward; bring back the good old days.

We also saw a disheartening phenomenon—People are losing interest in Hong Kong. As one of the main industries in Hong Kong, tourism contributed roughly 3.6% of Hong Kong's GDP in 2019. However, in 2021, this figure dropped to an alarming 0.1% due to the pandemic. Although it is recovering, with daily visitor arrivals after the resumption of normal travel returning to 47% of the pre-pandemic level in 2023, we must make some adjustments to push it even further, regaining our former prosperity. ([GovHK, 2023](https://www.gov.hk/en/about/abouthk/factsheets/docs/tourism.pdf))

## The Inspiration of the Feature—"Heat Things Up"
To make the product engaging, we have found the best reference, "popcat.click". It is a platform where people can join their countries and start accumulating clicks to compete with others. The idea is simple, and Hong Kong has contributed over 120 billion clicks, ranked the 2nd globally. It shows how competitive Hongkongers are, and they would love to engage in a similar website.

That was why we decided to introduce the feature—"Heat Things Up" in HKTAP. It is a feature that lets users vote (We call votes "Heats") on specific places continuously through the dynamic map on the home page. The more Heats, the pin gets bigger, and once it reaches 500 Heats, the display UI on top of the pin turns red, which means the place is getting popular.

## The Framework
The website consists of a camera option, a leaderboard, a category sorting system, and, most importantly, a map to display user-generated pins. When a user enters HKTAP, takes a photo, enters the title, description, and category, a pin will be generated on the dynamic map you see on the home page, with the location automatically recorded and displayed. In addition, users can also tap to vote on different places or view which sites are receiving the greatest attention.

## Obstacles and Solutions
One of the biggest challenges we have is how to make our product better than Google Maps. Thus, we focused on developing what Google Maps can't do. The data in Google Maps is static; they are based on buildings and specific locations. Hence, we built a truly dynamic platform. We let users generate content no matter where they go. It adds flexibility and less company dominance on search results. Besides, we also added something fun. Taking inspiration from "popcat.click" and adding interactive elements could potentially drive more engagement. Furthermore, we have implemented a strong AI Chatbot for users who need travel guidance or suggestions. They can also export the plans made by our AI assistance and add them to their calendars.

Another problem is that when the places are too close to each other, they collide. Hence, with the help of Amazon Q, we received a suggestion—`<MarkerClusterGroup />`. Then, we integrated the code into our project, making the UI polished, and it solved the problem. It is crucial because, without it, the site may potentially be unusable if the data is too large.

During the development, we found out that using the pin pop-up from React Leaflet is unstable. Whenever the data is updated with `<MarkerClusterGroup />` wrapped, it refreshes. As we want users to heat places up continuously, we found a different approach. We removed the pin pop-up, created a new UI element outside of the `<MarkerClusterGroup />`, and eventually used it to display all the details and placed the voting system there.

We figured out that we have to let users edit what they have published without account registration because people make mistakes. However, we want our product to be convenient; no registration. Thus, we added an optional password input for location sharing. You are required to enter the title, description, and category, but it is optional to enter a password. The password is for accessing the modification feature of your posts.

## Our Teamwork
We are a team with talents. To complete our work effectively, we have different roles.

• Ricky Chan (Developer & Designer)

• Thomas Suen (Developer & Photographer)

• Jeff Leung (Creative Strategist)

• Jade Chan (Designer & Analyst)

## Scalability, Profitability, and How Inspirational
The scalability of this project is extremely large. We can host an event where the people who support (Last voted) the most popular place win a badge, t-shirts, or digital AWS plans after a specific period to bump the engagement. It can be accomplished with a site cookie. 

As for the profitability, we can make users pay for specific plans to decorate their map pins & UI above the pin. It can be implemented on the site with a few adjustments. We aim to increase overall tourism revenue in Hong Kong, which is strongly related to the local economy. If HKTAP is proposed to the government, we will receive a reliable source of funding and long-term collaboration, considering the platform's high practicality.

As a team of teens, I believe that demonstrating what we can build encourages others to do the same: stand out, develop, learn, and try our best; we have a chance. If we can do it, a new opportunity will be shown, a silver lining. It would be groundbreaking, jumping to a new era.

"As a local student who was, unfortunately, not accepted by the universities I applied to in Hong Kong, I understand that the current atmosphere in education is awkward. Institutions and local students are discouraged from engaging in STEM projects or other programs that spark innovations due to an overly restrictive examination system. That is why our project, our demonstration, is fiercely important; if aspiring youths know they can, they act."—Ricky

## We Love Our Platform
We love our product so much that during the initial development, we took a lot of goofy snapshots with it. You can also see the Causeway Bay post; it is a real sharing from one of our teammates. We also uploaded a photo we took during the Hands-on Build Together Session of this Hackathon and uploaded it to HKTAP; it was wonderful.

## Our Words
We love Hong Kong. Therefore, we made the product by devoting our hearts, muscles, and brains. We rushed to development every day after our classes ended. We are four ambitious youths; we hope to be the champion team, and therefore, we devoted every piece of our powerful souls to this project, and that is what makes us different: a team with ambition, determination, and innovation.
