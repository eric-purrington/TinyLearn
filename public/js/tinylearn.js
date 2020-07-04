$(() => {
  const url = "https://en.wikipedia.org/w/api.php";

  $.get("/api/user_data").then(data => {
    $(".username").text(data.username);
  });

  // eslint-disable-next-line no-unused-vars
  $("#randomPageFromWiki").on("click", () => {
    $(".randomPageTitle").text("");
    $(".renderHere").empty();
    $(".randomPageLink").empty();
    $.get("/api/category").then(data => {
      const passedCat = data.name;
      findAPage(passedCat);
    });
  });

  function findAPage(passedCat) {
    const cmtitleInput = "Category:" + passedCat;
    const catParams = {
      action: "query",
      list: "categorymembers",
      cmtitle: cmtitleInput,
      cmlimit: "75",
      format: "json"
    };

    let catUrl = url + "?origin=*";
    Object.keys(catParams).forEach(
      key => (catUrl += "&" + key + "=" + catParams[key])
    );

    $.ajax({
      url: catUrl,
      method: "GET"
    }).then(response => {
      let randomPage = Math.floor(
        Math.random() * response.query.categorymembers.length
      );
      let pickedPage = response.query.categorymembers[randomPage].title;
      while (
        pickedPage.startsWith("Portal:") ||
        pickedPage.startsWith("Category:") ||
        pickedPage.startsWith("File:")
      ) {
        randomPage = Math.floor(
          Math.random() * response.query.categorymembers.length
        );
        pickedPage = response.query.categorymembers[randomPage].title;
      }
      retrieveAndRenderKnowledge(pickedPage, passedCat);
    });
  }

  function retrieveAndRenderKnowledge(pickedPage, passedCat) {
    const pageParams = {
      action: "query",
      titles: pickedPage,
      prop: "extracts",
      exintro: "",
      format: "json",
      explaintext: ""
    };

    let pageUrl = url + "?origin=*";
    Object.keys(pageParams).forEach(key => {
      pageUrl += "&" + key + "=" + pageParams[key];
    });

    $.ajax({
      url: pageUrl,
      method: "GET"
    }).then(response => {
      const wikiPageA = `Learn more at <a href="https://en.wikipedia.org/wiki/${pickedPage}" target="_blank">${pickedPage}</a>`;
      const pageId = Object.keys(response.query.pages)[0];
      const knowledgeToRender = response.query.pages[pageId].extract.replace(
        /\n/g,
        "<br>"
      );
      $(".randomPageTitle").text(pickedPage);
      $(".renderHere").html(knowledgeToRender);
      $(".randomPageLink").html(wikiPageA);
    });
    postPickedPage(pickedPage, passedCat);
  }

  function postPickedPage(pickedPage, passedCat) {
    $.post("api/page", {
      name: pickedPage,
      category: passedCat
    });
  }

  $("#addSubject").on("click", () => {
    $(".addSubjectResponse").text("");
    const categoryToPost = $("#subjectName").val();
    $("#subjectName").val("");
    const cmtitleInput = "Category:" + categoryToPost;
    const validateParams = {
      action: "query",
      list: "categorymembers",
      cmtitle: cmtitleInput,
      cmlimit: "20",
      format: "json"
    };

    let validateUrl = url + "?origin=*";
    Object.keys(validateParams).forEach(key => {
      validateUrl += "&" + key + "=" + validateParams[key];
    });

    $.ajax({
      url: validateUrl,
      method: "GET"
    }).then(response => {
      const possibleError = response.query.categorymembers[0];
      // eslint-disable-next-line eqeqeq
      if (possibleError == null) {
        addSubjectSecondChance(categoryToPost);
        // eslint-disable-next-line no-else-return
      } else {
        $(".addSubjectResponse").text(`${categoryToPost} added to database.`);
        postCat(categoryToPost);
      }
    });
  });

  function addSubjectSecondChance(categoryToPost) {
    const validateParams2 = {
      action: "query",
      format: "json",
      prop: "categories",
      titles: categoryToPost,
      cllimit: "100"
    };
  
    let validateUrl2 = url + "?origin=*";
    Object.keys(validateParams2).forEach(function(key){validateUrl2 += "&" + key + "=" + validateParams2[key];});
  
    $.ajax({
      url: validateUrl2,
      method: "GET"
    }).then(response => {
      const possibleError = response.query.pages[0];
      // eslint-disable-next-line eqeqeq
      if (possibleError == null) {
        $(".addSubjectResponse").text(
          `We're sorry, but ${categoryToPost} isn't a valid category name.`
        );
        return;
        // eslint-disable-next-line no-else-return
      } else {
        const pageId = Object.keys(response.query.pages)[0];
        let randomCat = Math.floor(
          Math.random() * response.query.pages[pageId].categories.length
        );
        let newCategoryToPost = response.query.pages[pageId].categories[randomCat].title;
        while (
          newCategoryToPost.includes("Wikipedia") ||
          newCategoryToPost.includes("Articles") ||
          newCategoryToPost.includes("articles") ||
          newCategoryToPost.includes("Pages") ||
          newCategoryToPost.includes("pages") ||
          newCategoryToPost.includes("Webarchive") ||
          newCategoryToPost.includes("maint")
        ) {
          randomCat = Math.floor(
            Math.random() * response.query.pages[pageId].categories.length
          );
          newCategoryToPost = response.query.pages[pageId].categories[randomCat].title;
        }
        newCategoryToPost = newCategoryToPost.replace(/Category:/g, "");
        $(".addSubjectResponse").text(`We're sorry, but ${categoryToPost} isn't a valid category name. So ${newCategoryToPost} was added to the database instead.`);
        postCat(newCategoryToPost);
      }
    });
  }

  function postCat(categoryToPost) {
    const rewrittenCategoryToPost = categoryToPost.replace(/ /g, "_");
    $.post("/api/category/add", {
      name: rewrittenCategoryToPost
    });
  }

  $(".fa-trash").on("click", function() {
    const id = $(this).attr("id");
    console.log(id);
    $.ajax({
      method: "DELETE",
      url: "/api/page/" + id
    }).then(() => {
      location.reload();
    });
  });
});
