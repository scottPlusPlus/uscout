const sectionVolunteer = `{
    "title": "Where can I volunteer?",
    "body" : "If you're passionate about making a difference in your community but don't know where to start, finding the right volunteer opportunity can be a challenge. Fortunately, there are many online resources available that can help you connect with local organizations and causes that align with your interests and skills.",
    "links" : [ 
       {
        "url": "volunteermatch.org",
        "comment": "Find local volunteer listings",
        "tags": []
      }, {
        "url": "www.dosomething.org/us",
        "comment": "Geared towards young people and provides resources for taking action on various social issues.",
        "tags": []
      }, {
        "url": "https://www.idealist.org/en",
        "comment": "Find career opportunities with nonprofit organizations.",
        "tags": []
      }, {
        "url": "meaningfulcode.org",
        "comment": "Write code for impactful projects that help the world.",
        "tags": []
      }
    ]
}`;

const sectionPolitics = `{
  "title": "How Can I Get More Involved With Political Activism?",
  "body" : "If you want to make big change, a great approach is through political activism.  Here are some links to help you connect with others and get started.",
  "links" : [ 
     {
      "url": "https://indivisible.org",
      "comment": "Find local or virtual groups to participate in contacting your representatives and general activism.",
      "tags": []
    }, {
      "url": "https://medium.com/swlh/this-is-how-you-find-protests-in-your-city-cfcbf9d48c8f",
      "comment": "An article describing how to find local protests through social media.",
      "tags": []
    }, {
      "url": "https://www.house.gov/representatives/find-your-representative#:~:text=If%20you%20know%20who%20your,the%20U.S.%20House%20switchboard%20operator",
      "comment": "Information on where to contact your representatives",
      "tags": []
    }, {
      "url": "https://www.aclu.org/writing-your-elected-representatives",
      "comment": "An article describes how to format your letters or calls to your representatives.",
      "tags": []
    }, {
      "url": "www.starvoting.org",
      "comment": "Organization working to give voters more power by updating our voting system beyond 'choose-one' voting.",
      "tags": []
    }
  ]
}`;

const sectionDonate = `{
  "title": "Where can I find the most impactful places to donate?",
  "body" : "Deciding where to donate your money can be a difficult decision, especially if you want to ensure that your donation has the greatest impact possible. Fortunately, there are several online resources that can help you evaluate different charities and determine which ones are most effective and efficient.",
  "links" : [{
      "url": "givewell.org",
      "comment": "The top rated charities that yield the most impact per dollar to save or improve lives.",
      "tags": []
    }, {
      "url": "charitynavigator.org",
      "comment": "A website that ranks charities based on their transparency and tax documents. ",
      "tags": []
    }
  ]
}`;

const sectionInspire = `{
    "title": "Some cool social-good projects to inspire me?",
    "size" : 1,
    "body" : "There are lots of amazing people working on amazing projects to make the world a better place.  Here are just a handful!",
    "links" : [{
        "url": "www.gapminder.org/dollar-street",
        "comment": "",
        "tags": []
      }, {
        "url": "ncase.me/polygons",
        "comment": "",
        "tags": []
      }, {
        "url": "ncase.me/ballot",
        "comment": "",
        "tags": []
      }, {
        "url": "www.starvoting.org",
        "comment": "",
        "tags": []
      }, {
        "url": "www.youtube.com/watch?v=DOWDNBu9DkU",
        "comment": "",
        "tags": []
      }
    ]
}`;

const sectionPoverty = `{
    "title": "What's the most efficient / effective way to solve poverty?",
    "body" : "Solving poverty is a complex and multifaceted challenge that requires a combination of short-term and long-term solutions. While there is no single answer to this question, there are several evidence-based approaches that have been shown to be effective in reducing poverty and improving the lives of those who are struggling. Some of the most promising strategies include investing in education and job training, providing access to financial services and resources, implementing progressive tax policies, and promoting inclusive economic growth.",
    "size" : 1,
    "links" : [{
        "url": "worldbank.org/en/topic/poverty/publication/poverty-and-equity-briefs",
        "comment": "",
        "tags": []
      }, {
        "url": "un.org/en/global-issues/ending-poverty",
        "comment": "",
        "tags": []
      }, {
        "url": "https://poverty.umich.edu/",
        "comment": "",
        "tags": []
      }
    ]
}`;

const sectionClimate = `{
    "title": "What's the most impactful way to tackle the climate crisis?",
    "body" : "The climate crisis is one of the most pressing challenges facing our planet today, and requires urgent action to reduce greenhouse gas emissions and mitigate the impacts of climate change. While there is no single solution to this complex problem, there are several evidence-based strategies that have been shown to be effective in addressing climate change and promoting sustainable development",
    "links" : [
        {
            "url": "climaterealityproject.org",
            "comment": "",
            "tags": [
                "climate"
            ]
        }, {
            "url": "climatevisuals.org",
            "comment": "",
            "tags": [
                "climate"
            ]
        }, {
        "url": "un.org/sustainabledevelopment/climate-action",
        "comment": "",
        "tags": []
      }, {
        "url": "thesolutionsproject.org/what-we-do",
        "comment": "",
        "tags": []
    }, {
        "url": "thecarbonalmanac.org",
        "comment": "",
        "tags": []
      }
    ]
}`;

const sectionData = `{
    "title": "Where can I find good DATA about big problems?",
    "body" : "Access to reliable and up-to-date data is essential for understanding and addressing the world's biggest challenges, from poverty and inequality to climate change and public health. Fortunately, there are many online resources available that provide access to high-quality data and analysis on a range of global issues.",
    "size" : 1,
    "links" : [
    {
        "url": "ourworldindata.org",
        "comment": "",
        "tags": []
      },{
        "url": "gapminder.org",
        "comment": "",
        "tags": []
        },{
        "url": "data.gov",
        "comment": "",
        "tags": []
      }, {
        "url": "hdr.undp.org",
        "comment": "",
        "tags": []
      }, {
        "url": "healthdata.org/data-tools-practices",
        "comment": "",
        "tags": []
    }, {
        "url": "ballotpedia.org",
        "comment": "",
        "tags": []
      }, {
        "url": "worldometers.info",
        "comment": "",
        "tags": []
      }  
    ]
}`;

export const activistPageDataJson = `[${sectionVolunteer},
  ${sectionPolitics}, 
  ${sectionDonate},
  ${sectionClimate},
  ${sectionInspire},
  ${sectionData}]`;
