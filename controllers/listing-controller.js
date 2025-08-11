const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const sequelize = require('../utilities/database');
const Settings = require('../helpers/settings-helper');
const { ListingsModel, ListingCarGalleryImages } = require('../database/models');

const BASE_URL = Settings._appBASEURL;

function buildFullUrl(filePath) {
  if (!filePath) return null;
  // Convert Windows backslashes to forward slashes for URL
  const normalizedPath = filePath.replace(/\\/g, '/');
  return `${BASE_URL}/${normalizedPath}`;
}

exports.getListingById = async (req, res) => {
  try {
    const listingId = req.params.listingId;

    const listing = await ListingsModel.findOne({
      where: { id: listingId },
      include: [
        {
          model: ListingCarGalleryImages,
          as: 'galleryImages',
          attributes: ['id', 'photoResized'],
        },
      ],
    });

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Build full URL for thumb image
    const thumbUrl = buildFullUrl(listing.thumb_Resized_image);

    // Build full URLs for gallery images
    const galleryImages = listing.galleryImages.map(img => ({
      id: img.id,
      photoResized: buildFullUrl(img.photoResized),
    }));

    res.status(200).json({
      listing: {
        ...listing.toJSON(),
        thumb_Resized_image: thumbUrl,
        galleryImages,
      },
    });
  } catch (error) {
    console.error('getListingById error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getSponsoredListings = async (req, res) => {
  try {
    let { page, size, orderBy, orderType } = req.query;

    page = parseInt(page) || 1;
    size = parseInt(size) || 10;
    const offset = (page - 1) * size;

    const listings = await ListingsModel.findAndCountAll({
      where: { isSponsored: true },
      distinct: true,
      limit: size,
      offset,
      order: [[orderBy || 'createdAt', orderType?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC']],
      include: [
        {
          model: ListingCarGalleryImages,
          as: 'galleryImages',
          attributes: ['id', 'photoResized'],
        },
      ],
    });

    const listingsWithUrls = listings.rows.map(listing => {
      const thumbUrl = buildFullUrl(listing.thumb_Resized_image);

      const galleryImages = listing.galleryImages.map(img => ({
        id: img.id,
        photoResized: buildFullUrl(img.photoResized),
      }));

      return {
        ...listing.toJSON(),
        thumb_Resized_image: thumbUrl,
        galleryImages,
      };
    });

    res.status(200).json({
      pagination: {
        totalItems: listings.count,
        perPage: size,
        currentPage: page,
        lastPage: Math.ceil(listings.count / size),
      },
      listings: listingsWithUrls,
    });
  } catch (error) {
    console.error('getSponsoredListings error:', error);
    res.status(500).json({ message: error.message });
  }
};


exports.getAllListings = async (req, res) => {
  try {
    let { page, size, keywords, orderBy, orderType, listingType } = req.query;

    page = parseInt(page) || 1;
    size = parseInt(size) || 10;
    const offset = (page - 1) * size;

    const whereClause = {};

    if (keywords) {
      whereClause.title = { [Op.like]: `%${keywords}%` };
    }

    const validListingTypes = ['fixed_price', 'live_auction'];
    if (listingType && validListingTypes.includes(listingType)) {
      whereClause.listingType = listingType;
    }

    const listings = await ListingsModel.findAndCountAll({
      where: whereClause,
      distinct: true,
      limit: size,
      offset,
      order: [[orderBy || 'createdAt', orderType?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC']],
      include: [
        {
          model: ListingCarGalleryImages,
          as: 'galleryImages',
          attributes: ['id', 'photoResized'],
        },
      ],
    });

    // Map listings to add full URLs for images
    const listingsWithUrls = listings.rows.map(listing => {
      const thumbUrl = buildFullUrl(listing.thumb_Resized_image);

      const galleryImages = listing.galleryImages.map(img => ({
        id: img.id,
        photoResized: buildFullUrl(img.photoResized),
      }));

      return {
        ...listing.toJSON(),
        thumb_Resized_image: thumbUrl,
        galleryImages,
      };
    });

    res.status(200).json({
      pagination: {
        totalItems: listings.count,
        perPage: size,
        currentPage: page,
        lastPage: Math.ceil(listings.count / size),
      },
      listings: listingsWithUrls,
    });
  } catch (error) {
    console.error('getAllListings error:', error);
    res.status(500).json({ message: error.message });
  }
};



exports.saveListing = async (req, res) => {
  try {
    const listingId = req.params.listingId;
    let listing = null;
    // destructure req.body fields
    const {
      title,
      description,
      location,
      year,
      make,
      model,
      trim,
      engine,
      drivetrain,
      transmission,
      mileage,
      vin,
      bodyStyle,
      exteriorColor,
      interiorColor,
      sellerType,
      chassisDescription,
      suspensionDescription,
      modificationNotes,
      askingPrice,
      fixedPrice,
      reservePrice,
      startingBidPrice,
      minBidIncrement,
      listingType,
      auctionStartTime,
      auctionEndTime,
      biddingDurationSeconds,
      isSponsored,
      sponsoredPlan,
      status,
    } = req.body;

    if (listingId) {
      listing = await ListingsModel.findOne({ where: { id: listingId } });
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }
    }

    const transaction = await sequelize.transaction();

    try {
      let listingData = {
        userId: req.userData.userId,
        title,
        description,
        location,
        year,
        make,
        model,
        trim,
        engine,
        drivetrain,
        transmission,
        mileage,
        vin,
        bodyStyle,
        exteriorColor,
        interiorColor,
        sellerType,
        chassisDescription,
        suspensionDescription,
        modificationNotes,
        askingPrice,
        fixedPrice,
        reservePrice,
        startingBidPrice,
        minBidIncrement,
        listingType,
        auctionStartTime,
        auctionEndTime,
        biddingDurationSeconds,
        isSponsored,
        sponsoredPlan,
        status,
      };

      // Handle thumbnail image
      if (req.files && req.files.thumb_Resized_image && req.files.thumb_Resized_image[0]) {
        if (listing && listing.thumb_Resized_image) {
          const oldThumbPath = path.join(__dirname, '..', 'public', listing.thumb_Resized_image);
          if (fs.existsSync(oldThumbPath)) {
            fs.unlinkSync(oldThumbPath);
          }
        }

        const file = req.files.thumb_Resized_image[0];
        const ext = path.extname(file.originalname); // e.g. '.jpg'
        let newFilename = file.filename;

        // Rename file on disk to add extension if missing
        if (!newFilename.endsWith(ext)) {
          const oldPath = file.path;
          newFilename += ext;
          const newPath = path.join(path.dirname(oldPath), newFilename);

          fs.renameSync(oldPath, newPath);
          // Update file.path to newPath so no stale refs remain
          file.path = newPath;
        }

        listingData.thumb_Resized_image = path.join('uploads', newFilename);
      }

      // Create or update listing
      if (listingId) {
        await ListingsModel.update(listingData, { where: { id: listingId }, transaction });
      } else {
        listing = await ListingsModel.create(listingData, { transaction });
      }

      const currentListingId = listingId || listing.id;

      // Handle gallery images
      if (req.files && req.files.galleryImages && req.files.galleryImages.length > 0) {
        if (listingId) {
          const oldGalleryImages = await ListingCarGalleryImages.findAll({ where: { listingId: currentListingId } });
          for (const img of oldGalleryImages) {
            if (img.photoResized) {
              const oldGalleryPath = path.join(__dirname, '..', 'public', img.photoResized);
              if (fs.existsSync(oldGalleryPath)) {
                fs.unlinkSync(oldGalleryPath);
              }
            }
          }
          await ListingCarGalleryImages.destroy({ where: { listingId: currentListingId }, transaction });
        }

        const imagesToCreate = [];

        for (const file of req.files.galleryImages) {
          const ext = path.extname(file.originalname);
          let newFilename = file.filename;

          if (!newFilename.endsWith(ext)) {
            const oldPath = file.path;
            newFilename += ext;
            const newPath = path.join(path.dirname(oldPath), newFilename);
            fs.renameSync(oldPath, newPath);
            file.path = newPath;
          }

          imagesToCreate.push({
            listingId: currentListingId,
            photoResized: path.join('uploads', newFilename),
          });
        }

        await ListingCarGalleryImages.bulkCreate(imagesToCreate, { transaction });
      }

      // Delete specific gallery images if requested
      if (req.body.deletedImageIds && Array.isArray(req.body.deletedImageIds)) {
        const imagesToDelete = await ListingCarGalleryImages.findAll({
          where: { id: req.body.deletedImageIds, listingId: currentListingId },
        });

        for (const img of imagesToDelete) {
          if (img.photoResized) {
            const delGalleryPath = path.join(__dirname, '..', 'public', img.photoResized);
            if (fs.existsSync(delGalleryPath)) {
              fs.unlinkSync(delGalleryPath);
            }
          }
        }

        await ListingCarGalleryImages.destroy({
          where: { id: req.body.deletedImageIds, listingId: currentListingId },
          transaction,
        });
      }

      await transaction.commit();

      return res.status(listingId ? 200 : 201).json({
        message: 'Listing saved successfully',
        listingId: currentListingId,
      });
    } catch (error) {
      await transaction.rollback();
      return res.status(500).json({ message: error.message });
    }
  } catch (error) {
    console.error('saveListing controller error:', error);
    return res.status(500).json({ errors: error.message });
  }
};

exports.deleteListing = async (req, res) => {
  const listingId = req.params.listingId;

  try {
    const listing = await ListingsModel.findOne({
      where: { id: listingId },
      include: [
        {
          model: ListingCarGalleryImages,
          as: 'galleryImages',
          attributes: ['id', 'photoResized'],
        },
      ],
    });

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Start transaction
    const transaction = await sequelize.transaction();

    try {
      // Delete gallery images files
      for (const img of listing.galleryImages) {
        if (img.photoResized) {
          const imgPath = path.join(__dirname, '..', 'public', img.photoResized);
          if (fs.existsSync(imgPath)) {
            fs.unlinkSync(imgPath);
          }
        }
      }

      // Delete thumbnail file
      if (listing.thumb_Resized_image) {
        const thumbPath = path.join(__dirname, '..', 'public', listing.thumb_Resized_image);
        if (fs.existsSync(thumbPath)) {
          fs.unlinkSync(thumbPath);
        }
      }

      // Delete gallery image DB records
      await ListingCarGalleryImages.destroy({
        where: { listingId },
        transaction,
      });

      // Delete listing record
      await ListingsModel.destroy({
        where: { id: listingId },
        transaction,
      });

      await transaction.commit();

      return res.status(200).json({ message: 'Listing and related images deleted successfully' });
    } catch (error) {
      await transaction.rollback();
      console.error('Error deleting listing:', error);
      return res.status(500).json({ message: 'Failed to delete listing' });
    }
  } catch (error) {
    console.error('deleteListing controller error:', error);
    return res.status(500).json({ message: error.message });
  }
};

