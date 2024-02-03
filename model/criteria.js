const mongoose = require("mongoose");

const subCriteriaSchema = new mongoose.Schema(
  {
    criteria_id: {
      type: String,
    },
    sub_criteria: [
      {
        name: {
          type: String,
        },
        value: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

const SubCriteria = mongoose.model("SubCriteria", subCriteriaSchema);

const criteriaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    value: {
      type: String,
    },
    type: {
      type: String,
    },
    sub_criteria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCriteria",
    },
  },
  { timestamps: true }
);

criteriaSchema.pre("save", async function (next) {
  const criteria = this;

  if (!criteria.sub_criteria || criteria.sub_criteria.length === 0) {
    criteria.sub_criteria = [{ name: null, value: null }];
  }

  next();
});

criteriaSchema.post("save", async function (doc, next) {
  if (!doc.sub_criteria) {
    const subCriteria = new SubCriteria({
      name: doc.name,
      criteria_id: doc._id,
      sub_criteria: [{ name: null, value: null }],
    });

    await subCriteria.save();

    doc.sub_criteria = subCriteria._id;
    await doc.save();
  }

  next();
});

const Criteria = mongoose.model("Criteria", criteriaSchema);

module.exports = {
  Criteria,
  SubCriteria,
};
