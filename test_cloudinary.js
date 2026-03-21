const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dummy_cloud",
  api_key: "12345",
  api_secret: "secret",
});

const publicId = "hamroclient/documents/913682d3-6314-44fb-893c-b30a04179aa1/1773930926930_पासवर्ड_बिर्सनुभयो";

console.log("private_download_url (auth, empty format):", cloudinary.utils.private_download_url(publicId, "", {
  type: "authenticated",
  resource_type: "image"
}));

console.log("private_download_url (upload, empty format):", cloudinary.utils.private_download_url(publicId, "", {
  type: "upload",
  resource_type: "image"
}));

console.log("url (upload types):", cloudinary.utils.url(publicId, {
  type: "upload",
  resource_type: "image",
  secure: true
}));
