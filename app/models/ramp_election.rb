class RampElection < ActiveRecord::Base
  attr_reader :saving_receipt

  enum option_selected: {
    supplemental_claim: "supplemental_claim",
    higher_level_review: "higher_level_review",
    higher_level_review_with_hearing: "higher_level_review_with_hearing"
  }

  validates :receipt_date, :option_selected, presence: { message: "blank" }, if: :saving_receipt
  validate :validate_receipt_date

  def start_saving_receipt
    @saving_receipt = true
  end

  private

  def validate_receipt_date
    return unless notice_date && receipt_date

    if notice_date > receipt_date
      errors.add(:receipt_date, "before_notice_date")
    elsif Time.zone.today < receipt_date
      errors.add(:receipt_date, "in_future")
    end
  end
end
