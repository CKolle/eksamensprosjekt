
# How to run

To run the application simply pull the repository down to your local computer. Then open up a terminal window if you haven't already done so. Change the working directory to the `root` of this repository, and go through the `requirements.txt` file. Make sure you have all the dependencies needed (_Optionally you could make a venv_). As per the exam criterion, this project only relies on allowed third-party libraries. That being `Flask` and `Sqlalchemy 2.0`, note that other dependencies listed are sub-dependencies of `Flask`and `Sqlalchemy 2.0`. Once all the dependencies are sorted you are ready to run the application. Simply change the working directory to `root/api` and run the command `$ python app.py`. _This assumes you have the keyword `python` mapped to the python binary_. If it ran successfully the application should be running on `port 5000`.

_Note that this application comes with a prebuilt JavaScript bundle so you shouldn't need to build it yourself_

# Functionality list

This application fulfils all the criteria for the exam. And these will be mentioned in this chapter.

## Authentication

In regards to login and authentication, this application relies on `JWT-tokens` as its primary means of authentication. `JWT-tokens` also called `JavaScript Object Notation Web Tokens` is a common way to handle authentication on the modern web. It works by having a cryptographically signed token, this token includes a payload and header. The token is signed by the server and distributed to the clients. Since the token is signed by the server, the server can cryptographically validate that the token came from the server and that the contents of the payload are not tampered with. The `JWT-token` includes a payload containing an expiration time and a user id. So that when the client makes a request to a restricted route, it includes this `JWT-token`, the server validates that it was the one who distributed the token and accepts the request. If the token is invalid, being expired or simply wrong, then it would result in a `401 error`.

## Login

Login is handled by a common `password` and `username` setup. Where on login the user would send a post request containing the `password` and `username`. The server would then send back a valid `JWT-token`(See authentication for more information). The client would then store this `JWT-token` in local storage so the user can refresh the page without having to log in again. Note that on expiration the user would need to log in again. On logout, the client simply deletes the token from local storage and memory.

## Registering user

The user can register on the register page. Here they need to give a `password`, `username` and an `email`. The email is just there to flesh out the application and will not be used in any way as we don't have a mail server. The password needs to be at least eight characters long this is validated on the backend and frontend. The email must also be a valid email and the username has a limit of 50 chars and a min of 3.

## JS form validation

All forms and fields have an associated validation function on the client. The application would give an error in the form of a toast notifier. Input fields will get a red border with an error text under it explaining the error. There is also a blur on input fields notifying the user of errors even before they press the submit button. The application does reg ex checks on the email to ensure it is valid.

## Search and filter

This application offers a vast variety of searches and filters. We have the search page. Here the user can search for other users or posts on the platform or posts. The user can also visit other users' profile pages. Here they can see they can filter between media, these are posts containing images that the user has uploaded. Liked posts and a list of their posts sorted from most recent to oldest. You can filter by liked posts liked posts are stored on the client. Filtering options for search are stored in the route. So if the user refreshes/revisits the page the filter is still applied. The filtering options are either you search for users or posts. Further, on each profile, you can filter by "new" and "old". This filter option is stored in local storage until the user logs out. Meaning it persists across refreshes

## Ajax

Ajax is used in requests from the client.

## Fluid layout

A fluid layout is used. This can be easily noticed in the settings for the user. When the user resizes the page dynamically adapts to the window and positions it optimally. The application also uses flex and absolute. Display flex is used in a lot of places including many of the containers and wrappers. Absolute is also used, for instance in the number incrementer in text areas.

## Phone layout

Phone layout is present, though the project does not use `bootstrap`, we have achieved a response phone layout. All pages have been designed with phones in mind and media queries are used to change the page depending on the device size. For instance, on some pages, the container would stretch to fit the whole screen and optimize for the space available. We have also some novel design choices when it comes to navigation on mobile. Every page has a hamburger pop-up menu on the bottom right side. This allows for easy one-handed navigation, which is key when it comes to developing a good phone layout. This new hamburger menu becomes a navbar on bigger screen sizes, like on desktops.

## Navigation extras

In the previous point, I briefly mentioned the navbar. The navbar and the hamburger are navigation extras. They both have beautiful animations. And the navbar automatically hides and appears as you scroll, depending on the context. The navigation bar also allows for quick access to the user's profile by hovering over the profile picture. Then a drop-down will appear allowing the user to choose between profile and settings

## Semantic tags

Semantic tags are also used. For instance, the tag navigation is used for the navbar. Or the tag p is used for paragraphs. Or sections are used for different sections on the settings menu.

## Components

Components are also used. If you look at the source under the `client` and components you will see the custom components. Some notable ones include `components/Navigation/NavigationBar.vue` and `components/Forms/FormField.vue`. Notice the elegant validation in the `FormField.vue`.

## Rest API

The backend abides by the principles of REST. An important principle is the concept of stateless. According to the original paper of Roy Thomas Fielding (`https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm`). in section 5.1.3: "We next add a constraint to the client-server interaction: communication must be stateless in nature, as in the client-stateless-server (CSS) ..., such that each request from client to server must contain all of the information necessary to understand the request, and cannot take advantage of any stored context on the server. Session state is therefore kept entirely on the client". This is the primary reason why JWT tokens were chosen, and the decisions on route naming etc. For instance, if you want information on a user you would need to make a get request to `api/users/<uid>`. And also include the JWT token in the authentication header. Here all the information need to deliver the resource is present in the route itself. You have the `<uid>` in the route name and avoid creating state. Another principle is that the last element in an URL is the resource you are requesting, modifying or deleting. For instance, take the route `api/users/1/posts` with a get request. Here you would expect to get the users `posts` as `posts` is the last element in the URL. This practice is consistent throughout the application. If you just want all posts in general it would be `api/posts` as there is no longer any filter on the user.

## Data stored, updated, deleted

This application incorporates numerous data points in the SQLite database. We can add users, posts, likes and comments. Posts, users and likes can be deleted. Once they are deleted the data that relies on them is also deleted. Meaning that if a user deletes one of his posts, all of the comments associated with that post get deleted. The same goes for when the user is deleted. We also let the user change their profile picture and profile banner.

## Errors displayed

For displaying errors we use a combination of highlighting the field that is incorrect with an error message and showing a toast notifier. This can be seen in the registration form. If you misspell the repeat password for instance. The client will give you a clear error once you blur or try to submit. The application also incorporates a toast notifier, for other errors. The toast notifier will appear as a red square if you have invalid credentials, your JWT token is expired, and you try to give a huge file as a profile picture... etc. 

## Extra feature

The application also got extra features. These include `vuex`, `vue-router`, `image upload`, `image validation`, and `Smart use of custom components`.

Vuex is used to store information about the user. So that we can get easy access to information about the user such as username, profile picture or but not limited to the `JWT token`. Since this kind of information is used in a lot of different parts of the application `vuex` gives the application easy access to it. Furthermore, the vuex store is also used as a cache for information about other users such as their usernames and profile pictures. This is to avoid sending too many requests fetching the same information over and over again. The cache is of course flushed once the component that relies on the cache is unmounted.

Vue-router is used to give clean routes to a single-page application. For instance, if you go to a user's profile the route in the browser would be `user/<uid>`. Similarly for posts. We also use vue router to handle different types of subviews for instance in the settings page where you can switch between account settings or profile settings. The route also changes, without refreshing the page.

Image upload is also possible. One can upload images when creating a new post or changing a profile banner or profile picture. 

The images are also validated on the backend. The backend has a custom wrapper function called `image_validated` this serves as a middleware to ensure the image is safe or does not flood the server. The server will deny any images over 5 megabytes and will scan the file signature of the byte stream to ensure that the image is of the right type. Allowed image types can be specified on a per-route basis. This is used with profile pictures since we do allow GIFs as profile pictures, but we do not want GIFs in posts and banner images. The reason why we have to scan the byte stream is that the default implementation in werkzeug is trivially easy to fool. Simply change the extension name of the file and werkzeug will report this as the new mime-type. By looking at the file signature, we can prevent this bypass. 

The application also handles the dates of posts. If you visit a post the date of the post will be displayed in the local time format of the browser. Note that this depends on the time format specified by the browser, and indirectly by the os in most cases. Meaning that if you have for instance `British` locales(en_GB) on your computer the browser should display it using `British` locales.

Dynamic loading is also a key component of the application. The application will for instance request more posts or users as you scroll to the bottom of the page. This is done because there might be hundreds of thousands of posts on a social media site. Thus it is necessary to have dynamic loading in place

# Testing

For testing the application you can use the test user called `Alice`. With the creative password of `password`. For testing, we recommend that you go through the feature list and test that they work. Note that the tests folder was only used during development, and provides interesting insight on the development process. Some tests may no longer work, as they were never updated when the application changed. We encourage you to make a user and change the profile picture.

# Other

All icons used are from bootstrap.

