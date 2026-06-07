import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Upload, X, AlertCircle } from 'lucide-react';
import { createAuction } from '../services/api';

interface FormData {
  title: string;
  description: string;
  category: string;
  condition: string;
  images: File[];
  auctionType: string;
  startingBid: string;
  reservePrice: string;
  buyItNowPrice: string;
  minBidIncrement: string;
  startDateTime: string;
  endDateTime: string;
  shippingMethod: string;
  shippingCost: string;
  estimatedDeliveryDays: string;
  itemLocation: string;
}

interface FormErrors {
  [key: string]: string;
}

export function CreateAuctionPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    condition: '',
    images: [],
    auctionType: '',
    startingBid: '',
    reservePrice: '',
    buyItNowPrice: '',
    minBidIncrement: '',
    startDateTime: '',
    endDateTime: '',
    shippingMethod: '',
    shippingCost: '0',
    estimatedDeliveryDays: '',
    itemLocation: '',
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (submitAttempted) {
      validateField(field, value);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const currentImages = formData.images;

    if (currentImages.length + files.length > 5) {
      setErrors({ ...errors, images: 'Maximum 5 images allowed' });
      return;
    }

    const newImages = [...currentImages, ...files];
    setFormData({ ...formData, images: newImages });

    const newPreviews = [...imagePreviews];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        setImagePreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });

    if (submitAttempted) {
      validateField('images', newImages);
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
    setImagePreviews(newPreviews);
  };

  const validateField = (field: keyof FormData, value: any): string => {
    let error = '';

    switch (field) {
      case 'title':
        if (!value) error = 'Item title is required';
        break;
      case 'description':
        if (!value) error = 'Item description is required';
        break;
      case 'category':
        if (!value) error = 'Category is required';
        break;
      case 'condition':
        if (!value) error = 'Item condition is required';
        break;
      case 'images':
        if (value.length === 0) error = 'At least 1 image is required';
        break;
      case 'auctionType':
        if (!value) error = 'Auction type is required';
        break;
      case 'startingBid':
        if (!value) error = 'Starting bid is required';
        else if (Number(value) <= 0) error = 'Starting bid must be greater than 0';
        break;
      case 'minBidIncrement':
        if (!value) error = 'Minimum bid increment is required';
        else if (Number(value) <= 0) error = 'Minimum bid increment must be greater than 0';
        break;
      case 'startDateTime':
        if (!value) error = 'Start date and time is required';
        break;
      case 'endDateTime':
        if (!value) error = 'End date and time is required';
        else if (formData.startDateTime && new Date(value) <= new Date(formData.startDateTime)) {
          error = 'End date must be after start date';
        } else if (formData.auctionType === 'Flash') {
          const duration = (new Date(value).getTime() - new Date(formData.startDateTime).getTime()) / (1000 * 60);
          if (duration > 60) error = 'Flash auctions cannot exceed 60 minutes';
        }
        break;
      case 'shippingMethod':
        if (!value) error = 'Shipping method is required';
        break;
      case 'estimatedDeliveryDays':
        if (!value) error = 'Estimated delivery days is required';
        else if (Number(value) < 0) error = 'Delivery days cannot be negative';
        break;
      case 'itemLocation':
        if (!value) error = 'Item location is required';
        break;
      case 'reservePrice':
        if (value && formData.startingBid && Number(value) <= Number(formData.startingBid)) {
          error = 'Reserve price must be greater than starting bid';
        }
        break;
      case 'buyItNowPrice':
        if (value) {
          const reserve = Number(formData.reservePrice) || Number(formData.startingBid);
          if (Number(value) <= reserve) {
            error = 'Buy It Now price must be greater than reserve price';
          }
        }
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return error;
  };

  const validateAllFields = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    const fieldsToValidate: (keyof FormData)[] = [
      'title',
      'description',
      'category',
      'condition',
      'images',
      'auctionType',
      'startingBid',
      'minBidIncrement',
      'startDateTime',
      'endDateTime',
      'shippingMethod',
      'estimatedDeliveryDays',
      'itemLocation',
    ];

    fieldsToValidate.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    if (formData.reservePrice) {
      const error = validateField('reservePrice', formData.reservePrice);
      if (error) {
        newErrors.reservePrice = error;
        isValid = false;
      }
    }

    if (formData.buyItNowPrice) {
      const error = validateField('buyItNowPrice', formData.buyItNowPrice);
      if (error) {
        newErrors.buyItNowPrice = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSaveDraft = () => {
    console.log('Saving draft...', formData);
    alert('Draft saved successfully! (Mock implementation)');
  };

  const handlePreview = () => {
    console.log('Preview auction...', formData);
    alert('Preview functionality coming soon! (Mock implementation)');
  };

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    if (validateAllFields()) {
      try {
        const payload = {
          title: formData.title,
          description: formData.description,
          startingBid: formData.startingBid,
          endTime: new Date(formData.endDateTime).toISOString(),
          email: localStorage.getItem("email"),
          imageUrl: imagePreviews[0] || "",
          images: JSON.stringify(imagePreviews)
        };
        
        await createAuction(payload);
        alert('Auction created successfully!');
        navigate('/');
      } catch (error) {
        console.error("Failed to create auction", error);
        alert("Failed to submit auction to the backend. Is Spring Boot running?");
      }
    } else {
      const firstErrorField = Object.keys(errors)[0];
      const element = document.getElementById(firstErrorField);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const sections = [
    { id: 1, name: 'Item Details', completed: formData.title && formData.description && formData.category && formData.condition && formData.images.length > 0 },
    { id: 2, name: 'Auction Config', completed: formData.auctionType && formData.startingBid && formData.minBidIncrement },
    { id: 3, name: 'Timing', completed: formData.startDateTime && formData.endDateTime },
    { id: 4, name: 'Delivery', completed: formData.shippingMethod && formData.estimatedDeliveryDays && formData.itemLocation },
  ];

  const errorField = (errMsg: string | undefined) => (
    <AnimatePresence>
      {errMsg && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.22 }}
          className="text-sm text-destructive mt-1 flex items-center space-x-1 overflow-hidden"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errMsg}</span>
        </motion.p>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex items-center justify-between mb-6"
        >
          <Link to="/" className="inline-flex items-center space-x-2 text-primary hover:underline">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Auctions</span>
          </Link>
          <button
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
          className="text-3xl font-bold text-foreground mb-8"
        >
          Create New Auction
        </motion.h1>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18, ease: 'easeOut' }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            {sections.map((section, index) => (
              <div key={section.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <motion.div
                    animate={{
                      scale: activeSection === section.id ? 1.12 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                      section.completed
                        ? 'bg-accent text-accent-foreground'
                        : activeSection === section.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {section.id}
                  </motion.div>
                  <div className="text-xs mt-2 text-center font-medium hidden sm:block">{section.name}</div>
                </div>
                {index < sections.length - 1 && (
                  <div className={`h-1 flex-1 mx-2 transition-colors duration-500 ${section.completed ? 'bg-accent' : 'bg-secondary'}`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Section 1 - Item Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.22, ease: 'easeOut' }}
          className="bg-card rounded-xl shadow-md p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-foreground mb-4 pb-3 border-b border-border">
            Section 1 — Item Details
          </h2>

          <div className="space-y-4">
            {/* Item Title */}
            <div id="title">
              <label className="block text-sm font-medium text-foreground mb-1">
                Item Title <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter item title"
              />
              {errorField(errors.title)}
            </div>

            {/* Item Description */}
            <div id="description">
              <label className="block text-sm font-medium text-foreground mb-1">
                Item Description <span className="text-destructive">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Describe your item in detail"
              />
              {errorField(errors.description)}
            </div>

            {/* Category & Condition Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div id="category">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Category <span className="text-destructive">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select category</option>
                  <option value="Art">Art</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Vehicles">Vehicles</option>
                  <option value="Collectibles">Collectibles</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Other">Other</option>
                </select>
                {errorField(errors.category)}
              </div>

              <div id="condition">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Item Condition <span className="text-destructive">*</span>
                </label>
                <select
                  value={formData.condition}
                  onChange={(e) => handleInputChange('condition', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select condition</option>
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
                {errorField(errors.condition)}
              </div>
            </div>

            {/* Item Images */}
            <div id="images">
              <label className="block text-sm font-medium text-foreground mb-1">
                Item Images <span className="text-destructive">*</span>
                <span className="text-muted-foreground font-normal ml-2">(Max 5 images)</span>
              </label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={formData.images.length >= 5}
                />
                <label
                  htmlFor="image-upload"
                  className={`cursor-pointer inline-flex flex-col items-center ${
                    formData.images.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Upload className="w-12 h-12 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload images ({formData.images.length}/5)
                  </span>
                </label>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-4">
                  <AnimatePresence>
                    {imagePreviews.map((preview, index) => (
                      <motion.div
                        key={`preview-${index}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                        className="relative group"
                      >
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-border"
                        />
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {errorField(errors.images)}
            </div>
          </div>
        </motion.div>

        {/* Section 2 - Auction Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.32, ease: 'easeOut' }}
          className="bg-card rounded-xl shadow-md p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-foreground mb-4 pb-3 border-b border-border">
            Section 2 — Auction Configuration
          </h2>

          <div className="space-y-4">
            {/* Auction Type */}
            <div id="auctionType">
              <label className="block text-sm font-medium text-foreground mb-1">
                Auction Type <span className="text-destructive">*</span>
              </label>
              <select
                value={formData.auctionType}
                onChange={(e) => handleInputChange('auctionType', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select auction type</option>
                <option value="English">English</option>
                <option value="Dutch">Dutch</option>
                <option value="Silent">Silent</option>
                <option value="Flash">Flash</option>
              </select>
              {errorField(errors.auctionType)}
            </div>

            {/* Starting Bid & Min Bid Increment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div id="startingBid">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Starting Bid <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <input
                    type="number"
                    value={formData.startingBid}
                    onChange={(e) => handleInputChange('startingBid', e.target.value)}
                    className="w-full pl-8 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                {errorField(errors.startingBid)}
              </div>

              <div id="minBidIncrement">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Minimum Bid Increment <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <input
                    type="number"
                    value={formData.minBidIncrement}
                    onChange={(e) => handleInputChange('minBidIncrement', e.target.value)}
                    className="w-full pl-8 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum amount each new bid must raise by
                </p>
                {errorField(errors.minBidIncrement)}
              </div>
            </div>

            {/* Reserve Price */}
            <div id="reservePrice">
              <label className="block text-sm font-medium text-foreground mb-1">Reserve Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <input
                  type="number"
                  value={formData.reservePrice}
                  onChange={(e) => handleInputChange('reservePrice', e.target.value)}
                  className="w-full pl-8 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Auction cancels if this price is not met
              </p>
              {errorField(errors.reservePrice)}
            </div>

            {/* Buy It Now Price */}
            <div id="buyItNowPrice">
              <label className="block text-sm font-medium text-foreground mb-1">Buy It Now Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <input
                  type="number"
                  value={formData.buyItNowPrice}
                  onChange={(e) => handleInputChange('buyItNowPrice', e.target.value)}
                  className="w-full pl-8 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Bidder can win instantly at this price
              </p>
              {errorField(errors.buyItNowPrice)}
            </div>
          </div>
        </motion.div>

        {/* Section 3 - Timing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.42, ease: 'easeOut' }}
          className="bg-card rounded-xl shadow-md p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-foreground mb-4 pb-3 border-b border-border">
            Section 3 — Timing
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Start Date and Time */}
              <div id="startDateTime">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Start Date and Time <span className="text-destructive">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.startDateTime}
                  onChange={(e) => handleInputChange('startDateTime', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errorField(errors.startDateTime)}
              </div>

              {/* End Date and Time */}
              <div id="endDateTime">
                <label className="block text-sm font-medium text-foreground mb-1">
                  End Date and Time <span className="text-destructive">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.endDateTime}
                  onChange={(e) => handleInputChange('endDateTime', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errorField(errors.endDateTime)}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section 4 - Delivery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.52, ease: 'easeOut' }}
          className="bg-card rounded-xl shadow-md p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-foreground mb-4 pb-3 border-b border-border">
            Section 4 — Delivery
          </h2>

          <div className="space-y-4">
            {/* Shipping Method */}
            <div id="shippingMethod">
              <label className="block text-sm font-medium text-foreground mb-1">
                Shipping Method <span className="text-destructive">*</span>
              </label>
              <select
                value={formData.shippingMethod}
                onChange={(e) => handleInputChange('shippingMethod', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select shipping method</option>
                <option value="Self Ship">Self Ship</option>
                <option value="Platform Courier">Platform Courier</option>
                <option value="Pickup Only">Pickup Only</option>
              </select>
              {errorField(errors.shippingMethod)}
            </div>

            {/* Shipping Cost & Estimated Delivery Days */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div id="shippingCost">
                <label className="block text-sm font-medium text-foreground mb-1">Shipping Cost</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <input
                    type="number"
                    value={formData.shippingCost}
                    onChange={(e) => handleInputChange('shippingCost', e.target.value)}
                    className="w-full pl-8 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div id="estimatedDeliveryDays">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Estimated Delivery Days <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  value={formData.estimatedDeliveryDays}
                  onChange={(e) => handleInputChange('estimatedDeliveryDays', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. 3"
                  min="0"
                />
                {errorField(errors.estimatedDeliveryDays)}
              </div>
            </div>

            {/* Item Location */}
            <div id="itemLocation">
              <label className="block text-sm font-medium text-foreground mb-1">
                Item Location / City <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.itemLocation}
                onChange={(e) => handleInputChange('itemLocation', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. New York, NY"
              />
              {errorField(errors.itemLocation)}
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 sm:space-x-4"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSaveDraft}
            className="w-full sm:w-auto px-6 py-3 rounded-lg border border-border bg-secondary text-foreground hover:bg-secondary/80 transition-colors font-medium"
          >
            Save as Draft
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handlePreview}
            className="w-full sm:w-auto px-6 py-3 rounded-lg border border-border bg-secondary text-foreground hover:bg-secondary/80 transition-colors font-medium"
          >
            Preview
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors font-medium"
          >
            Submit for Review
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
